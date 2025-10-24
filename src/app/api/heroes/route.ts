import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const heroesDir = path.join(process.cwd(), 'public', 'dota2');
    const files = fs.readdirSync(heroesDir);
    
    // 过滤出 .png 文件并移除扩展名
    const heroes = files
      .filter(file => file.endsWith('.png'))
      .map(file => file.replace('.png', ''))
      .sort();

    return NextResponse.json(heroes);
  } catch (error) {
    console.error('获取英雄列表失败:', error);
    return NextResponse.json(
      { error: '获取英雄列表失败' },
      { status: 500 }
    );
  }
}