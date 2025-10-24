import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Player } from '@/config/players';

// 获取玩家数据文件路径
const getPlayersFilePath = () => {
  return path.join(process.cwd(), 'data', 'players.json');
};

// 获取备份文件路径
const getBackupFilePath = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(process.cwd(), 'data', `players-backup-${timestamp}.json`);
};

export async function PUT(request: NextRequest) {
  try {
    const updatedPlayer: Player = await request.json();

    if (!updatedPlayer.steamId) {
      return NextResponse.json(
        { error: 'Steam ID 是必需的' },
        { status: 400 }
      );
    }

    const filePath = getPlayersFilePath();
    
    // 读取当前数据
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: '玩家数据文件不存在' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const players: Player[] = JSON.parse(fileContent);

    // 查找要更新的玩家
    const playerIndex = players.findIndex(p => p.steamId === updatedPlayer.steamId);
    if (playerIndex === -1) {
      return NextResponse.json(
        { error: '未找到该玩家' },
        { status: 404 }
      );
    }

    // 创建备份
    const backupPath = getBackupFilePath();
    fs.writeFileSync(backupPath, fileContent, 'utf-8');

    // 更新玩家数据（保留其他字段）
    players[playerIndex] = {
      ...players[playerIndex],
      name: updatedPlayer.name,
      position: updatedPlayer.position,
      mainHeroes: updatedPlayer.mainHeroes
    };

    // 保存更新后的数据
    fs.writeFileSync(filePath, JSON.stringify(players, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: '玩家信息更新成功',
      player: players[playerIndex]
    });

  } catch (error) {
    console.error('更新玩家信息失败:', error);
    return NextResponse.json(
      { error: '更新玩家信息失败' },
      { status: 500 }
    );
  }
}