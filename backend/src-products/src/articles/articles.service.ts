import { Injectable, NotFoundException } from '@nestjs/common';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export type CmsArticle = {
  id: number;
  title: string;
  subtitle?: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image?: string;
  synopsis: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

type ArticleInput = Partial<Omit<CmsArticle, 'id' | 'createdAt' | 'updatedAt'>>;

const defaultArticles: CmsArticle[] = [
  {
    id: 1,
    title: 'Sợi carbon autoclave và độ cứng cấu trúc',
    subtitle: 'Quy trình ép nhiệt carbon prepreg cho phụ tùng hiệu năng cao.',
    category: 'Vật liệu',
    readTime: '6 phút đọc',
    date: '24/05/2026',
    author: 'AEROTEC Lab',
    image: '/images/cars/apex-r7.png',
    synopsis:
      'Phân tích cách áp suất lò hấp và chu kỳ làm nguội ảnh hưởng tới độ cứng của phụ tùng carbon.',
    content:
      'Quy trình autoclave giúp kiểm soát áp suất, nhiệt độ và lượng nhựa epoxy trong từng lớp carbon. Với phụ tùng khí động học, độ ổn định hình học quan trọng không kém trọng lượng thấp.',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'ECU thông minh và telemetry người lái',
    subtitle: 'Tối ưu bản đồ động cơ dựa trên dữ liệu phản hồi thời gian thực.',
    category: 'Điện tử',
    readTime: '8 phút đọc',
    date: '18/04/2026',
    author: 'AEROTEC Engineering',
    image: '/images/cars/nova-x.png',
    synopsis:
      'Cách các cảm biến telemetry giúp ECU điều chỉnh lực kéo, phản hồi ga và ổn định thân xe.',
    content:
      'ECU hiệu năng cao không chỉ tăng công suất. Nó cần phối hợp giữa bướm ga, đánh lửa, mô-men và độ bám để xe dễ kiểm soát hơn trong điều kiện đường đua.',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable()
export class ArticlesService {
  private readonly storagePath = join(process.cwd(), 'uploads', 'cms', 'articles.json');

  findAll(includeDrafts = false): CmsArticle[] {
    const articles = this.readArticles();
    return includeDrafts ? articles : articles.filter((article) => article.isPublished);
  }

  findOne(id: number, includeDrafts = false): CmsArticle {
    const article = this.findAll(includeDrafts).find((item) => item.id === id);
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  create(input: ArticleInput): CmsArticle {
    const articles = this.readArticles();
    const now = new Date().toISOString();
    const article: CmsArticle = {
      id: articles.length ? Math.max(...articles.map((item) => item.id)) + 1 : 1,
      title: input.title?.trim() || 'Bài viết AEROTEC',
      subtitle: input.subtitle?.trim() || '',
      category: input.category?.trim() || 'Kỹ thuật',
      readTime: input.readTime?.trim() || '5 phút đọc',
      date: input.date?.trim() || new Intl.DateTimeFormat('vi-VN').format(new Date()),
      author: input.author?.trim() || 'AEROTEC Editorial',
      image: input.image?.trim() || '/images/cars/apex-r7.png',
      synopsis: input.synopsis?.trim() || '',
      content: input.content?.trim() || '',
      isPublished: input.isPublished !== false,
      createdAt: now,
      updatedAt: now,
    };

    this.writeArticles([article, ...articles]);
    return article;
  }

  update(id: number, input: ArticleInput): CmsArticle {
    const articles = this.readArticles();
    const index = articles.findIndex((item) => item.id === id);
    if (index < 0) throw new NotFoundException('Article not found');

    const current = articles[index];
    const updated: CmsArticle = {
      ...current,
      ...this.stripUndefined(input),
      updatedAt: new Date().toISOString(),
    };
    articles[index] = updated;
    this.writeArticles(articles);
    return updated;
  }

  remove(id: number): { deleted: true } {
    const articles = this.readArticles();
    const nextArticles = articles.filter((item) => item.id !== id);
    if (nextArticles.length === articles.length) throw new NotFoundException('Article not found');
    this.writeArticles(nextArticles);
    return { deleted: true };
  }

  private readArticles(): CmsArticle[] {
    this.ensureStorage();
    try {
      const parsed = JSON.parse(readFileSync(this.storagePath, 'utf8'));
      return Array.isArray(parsed) ? parsed : defaultArticles;
    } catch {
      this.writeArticles(defaultArticles);
      return defaultArticles;
    }
  }

  private writeArticles(articles: CmsArticle[]) {
    this.ensureStorage();
    writeFileSync(this.storagePath, JSON.stringify(articles, null, 2), 'utf8');
  }

  private ensureStorage() {
    mkdirSync(join(process.cwd(), 'uploads', 'cms'), { recursive: true });
  }

  private stripUndefined<T extends Record<string, any>>(data: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
  }
}
