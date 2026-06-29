import { Injectable, OnModuleInit } from '@nestjs/common';

interface CacheEntry {
  value: any;
  expireAt?: number;
  createdAt: number;
}

interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
  types: {
    [key: string]: number;
  };
}

@Injectable()
export class CacheService implements OnModuleInit {
  private cache: Map<string, CacheEntry> = new Map();
  private hits = 0;
  private misses = 0;
  private readonly defaultTTL = 3600000; // 1小时

  onModuleInit() {
    // 初始化定时清理过期缓存
    setInterval(() => {
      this.cleanExpired();
    }, 60000); // 每分钟检查一次
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // 检查过期
    if (entry.expireAt && Date.now() > entry.expireAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    const entry: CacheEntry = {
      value,
      createdAt: Date.now(),
      expireAt: ttlMs ? Date.now() + ttlMs : undefined,
    };
    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(type?: string): Promise<number> {
    let count = 0;

    if (type) {
      // 按类型清除
      for (const [key] of this.cache) {
        if (key.startsWith(type + ':')) {
          this.cache.delete(key);
          count++;
        }
      }
    } else {
      // 清除所有
      count = this.cache.size;
      this.cache.clear();
    }

    return count;
  }

  async getStats(): Promise<CacheStats> {
    const types: { [key: string]: number } = {};

    for (const [key] of this.cache) {
      const type = key.split(':')[0] || 'other';
      types[type] = (types[type] || 0) + 1;
    }

    // 估算内存使用
    const estimatedMemory = this.estimateMemoryUsage();

    const totalHits = this.hits + this.misses;
    const hitRate = totalHits > 0 ? (this.hits / totalHits) * 100 : 0;

    return {
      totalKeys: this.cache.size,
      memoryUsage: estimatedMemory,
      hitRate: Math.round(hitRate * 100) / 100,
      types,
    };
  }

  private cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (entry.expireAt && now > entry.expireAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[CacheService] Cleaned ${cleaned} expired cache entries`);
    }
  }

  private estimateMemoryUsage(): string {
    let totalSize = 0;

    for (const [key, entry] of this.cache) {
      totalSize += key.length;
      totalSize += JSON.stringify(entry.value).length;
    }

    if (totalSize < 1024) {
      return `${totalSize} B`;
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(2)} KB`;
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  // 清除缓存（供controller调用）
  async clearCache(type?: string): Promise<{ cleared: number }> {
    const cleared = await this.clear(type);
    return { cleared };
  }
}
