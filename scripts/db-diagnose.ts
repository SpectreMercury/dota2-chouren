import fs from 'fs';
import path from 'path';
import dns from 'dns';

// Load .env.local minimally (no extra deps) so script matches app env
function loadDotenv(file: string) {
  try {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf-8');
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (e) {
    console.warn('[DB_DIAG] 读取 .env 文件失败:', (e as any)?.message || e);
  }
}

loadDotenv(path.join(process.cwd(), '.env'));
loadDotenv(path.join(process.cwd(), '.env.local'));

// Ensure diagnostics enabled and default timeout
process.env.DB_DIAG = process.env.DB_DIAG || '1';
process.env.DB_TIMEOUT_MS = process.env.DB_TIMEOUT_MS || '30000';

// Import after env is loaded so prisma picks it up
// Defer importing prisma until after env is set
let prisma: any;

function maskUri(uri: string) {
  try {
    const u = new URL(uri);
    if (u.username || u.password) {
      u.username = u.username ? '***' : '';
      u.password = u.password ? '***' : '';
    }
    return u.toString();
  } catch {
    return '(invalid URI)';
  }
}

async function main() {
  const used = process.env.MONGODB_URI ? 'MONGODB_URI' : (process.env.DOTA2_MONGODB_URI ? 'DOTA2_MONGODB_URI' : (process.env as any).dota2_MONGODB_URI ? 'dota2_MONGODB_URI' : 'NONE');
  const uri = process.env.MONGODB_URI || (process.env.DOTA2_MONGODB_URI || (process.env as any).dota2_MONGODB_URI) || '';
  console.log('[DB_DIAG] 使用的变量:', used);
  console.log('[DB_DIAG] URI(脱敏):', uri ? maskUri(uri) : '(未设置)');
  console.log('[DB_DIAG] DNS servers:', dns.getServers());
  if (uri) {
    try {
      const u = new URL(uri);
      console.log('[DB_DIAG] 协议:', u.protocol, '主机:', u.hostname, '路径:', u.pathname);
      if (u.protocol === 'mongodb+srv:') {
        const srvName = `_mongodb._tcp.${u.hostname}`;
        await new Promise<void>((resolve) => {
          dns.resolveSrv(srvName, async (err, addresses) => {
            if (err) {
              console.warn('[DB_DIAG] SRV 解析失败:', srvName, err.message);
              resolve();
              return;
            }
            console.log('[DB_DIAG] SRV 解析成功: 条数', addresses.length);
            for (const a of addresses) {
              console.log('  - target:', a.name || a.name, 'host:', a.name, 'port:', a.port, 'priority:', a.priority, 'weight:', a.weight);
            }
            // Try A/AAAA for the first target to see if IP is reachable via DNS
            const first = addresses[0]?.name;
            if (first) {
              await new Promise<void>((done) => {
                dns.resolve4(first, (e4, ips4) => {
                  if (e4) console.warn('[DB_DIAG] A 解析失败:', first, e4.message);
                  else console.log('[DB_DIAG] A 解析:', first, ips4);
                  done();
                });
              });
              await new Promise<void>((done) => {
                dns.resolve6(first, (e6, ips6) => {
                  if (e6) console.warn('[DB_DIAG] AAAA 解析失败:', first, e6.message);
                  else console.log('[DB_DIAG] AAAA 解析:', first, ips6);
                  done();
                });
              });
            }
            resolve();
          });
        });
        // Resolve TXT for additional options like replicaSet
        await new Promise<void>((resolve) => {
          dns.resolveTxt(u.hostname, (err, records) => {
            if (err) {
              console.warn('[DB_DIAG] TXT 解析失败:', u.hostname, err.message);
              resolve();
              return;
            }
            const flat = records.map(r => r.join('')).join(' ');
            console.log('[DB_DIAG] TXT 解析:', flat || '(无)');
            resolve();
          });
        });
      }
    } catch (e) {
      console.warn('[DB_DIAG] URI 解析失败:', (e as any)?.message || e);
    }
  }

  // Import prisma now that env is ready
  try {
    const mod = await import('@/lib/prisma');
    prisma = mod.prisma;
  } catch (e) {
    console.error('[DB_DIAG] 导入 prisma 失败:', (e as any)?.message || e);
    process.exit(1);
  }

  // Try to connect and run a trivial query
  try {
    console.log('[DB_DIAG] 尝试连接数据库...');
    await prisma.$connect();
    console.log('[DB_DIAG] $connect 成功，尝试查询 players(1) ...');
    const rows = await prisma.player.findMany({ take: 1 });
    console.log('[DB_DIAG] 查询成功，返回条数:', rows.length);
  } catch (e: any) {
    console.error('[DB_DIAG] 连接/查询失败:', e?.message || e);
    if (e?.stack) console.error(e.stack.split('\n').slice(0, 8).join('\n'));
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  // Optional: generate a non-SRV URI and apply if requested
  try {
    const raw = process.env.MONGODB_URI || '';
    if (!raw) return;
    const u = new URL(raw);
    const hasDb = u.pathname && u.pathname !== '/';
    const dbName = hasDb ? u.pathname.slice(1) : (process.env.MONGODB_DATABASE || process.env.MONGODB_DB || process.env.DB_NAME || 'dota2');
    if (u.protocol === 'mongodb+srv:') {
      const srv = await new Promise<dns.SrvRecord[]>((resolve) => {
        dns.resolveSrv(`_mongodb._tcp.${u.hostname}`, (err, addrs) => resolve(err ? [] : addrs));
      });
      const txt = await new Promise<string[]>((resolve) => {
        dns.resolveTxt(u.hostname, (err, recs) => resolve(err ? [] : recs.map(r => r.join(''))));
      });
      const hosts = srv.map(a => `${a.name}:${a.port || 27017}`);
      const user = u.username;
      const pass = u.password;
      // Parse TXT options for replicaSet etc.
      const params = new URLSearchParams(u.searchParams);
      const txtAll = txt.join('&');
      if (txtAll) {
        for (const pair of txtAll.split('&')) {
          const [k, v] = pair.split('=');
          if (k && v && !params.has(k)) params.set(k, v);
        }
      }
      // Ensure core options
      if (!params.has('tls')) params.set('tls', 'true');
      if (!params.has('authSource')) params.set('authSource', 'admin');
      if (!params.has('retryWrites')) params.set('retryWrites', 'true');
      if (!params.has('w')) params.set('w', 'majority');
      params.set('appName', 'Prisma');
      const nosrv = `mongodb://${user}:${pass}@${hosts.join(',')}/${dbName}?${params.toString()}`;
      const masked = (() => { try { const uu = new URL(nosrv); uu.username = user ? '***' : ''; uu.password = pass ? '***' : ''; return uu.toString(); } catch { return '(invalid)'; } })();
      console.log('[DB_DIAG] 建议的非 SRV 连接串(脱敏):', masked);
      if (process.env.DB_DIAG_APPLY_NOSRV === '1') {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const bak = envPath + '.bak';
          fs.copyFileSync(envPath, bak);
          let content = fs.readFileSync(envPath, 'utf-8');
          const line = `MONGODB_URI="${nosrv}"`;
          if (/^MONGODB_URI=.*$/m.test(content)) {
            content = content.replace(/^MONGODB_URI=.*$/m, line);
          } else {
            content += (content.endsWith('\n') ? '' : '\n') + line + '\n';
          }
          fs.writeFileSync(envPath, content, 'utf-8');
          console.log('[DB_DIAG] 已写入非 SRV 连接串到 .env.local，并备份到 .env.local.bak');
        }
      }
    }
  } catch (e: any) {
    console.warn('[DB_DIAG] 生成非 SRV 连接串失败:', e?.message || e);
  }
}

main().catch((e) => {
  console.error('[DB_DIAG] 未捕获异常:', e?.message || e);
  process.exit(1);
});
