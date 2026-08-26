export type City = "Алматы" | "Астана" | "Шымкент";
export type RegistrationStatus = "planned" | "pending" | "paid" | "registered" | "visited" | "cancelled";
export type ActivityLevel = "BURN START" | "BURN ACTIVE" | "BURN PRO" | "BURN LEADER";

export type Resident = {
  id: string; name: string; company: string; role: string; city: City; categories: string[];
  image: string; joinedAt: string; bio: string; useful: string; request: string;
  website: string; instagram: string; telegram: string; companies: string[];
  score: number; attended: number; registered: number; cancelled: number; posts: number; comments: number;
};

export type ClubEvent = {
  id: string; title: string; description: string; day: number; date: string; time: string;
  city: City; place: string; organizerId: string; capacity: number; attendees: string[];
  price: number; image: string; categories: string[];
};

export type WinPost = {
  id: string; authorId: string; text: string; images: string[]; date: string;
  likes: string[]; fire: string[]; comments: { id: string; authorId: string; text: string; date: string }[];
  status: "published" | "moderation" | "removed"; official?: boolean;
};

export type Privilege = {
  id: string; company: string; residentId: string; title: string; description: string;
  benefit: string; city: City; category: string; logo: string;
};

export type NotificationItem = {
  id: string; type: "event" | "rating" | "membership" | "feed" | "system";
  title: string; body: string; date: string; read: boolean;
};

export const categories = ["Строительство", "Логистика", "Производство", "IT", "Маркетинг", "Финансы", "Инвестиции", "Недвижимость", "HoReCa", "Ритейл", "Медицина", "Образование", "Услуги", "Туризм", "E-commerce", "Авто"];

export const residents: Resident[] = [
  { id:"evelyn",name:"Evelyn Smith",company:"Burn Resident",role:"Основатель студии",city:"Алматы",categories:["Маркетинг","IT"],image:"/app-assets/evelyn-hero.png",joinedAt:"2025-04-15",bio:"Развивает цифровые продукты и визуальные бренды.",useful:"Продуктовый дизайн, брендинг, web3",request:"Партнёры для запуска digital-продуктов",website:"evelynsmith.com",instagram:"@evelynsmith",telegram:"@evelyn",companies:["Evelyn Studio"],score:1340,attended:27,registered:31,cancelled:4,posts:12,comments:67 },
  { id:"alina",name:"Алина Серикова",company:"Aline Studio",role:"Собственник",city:"Алматы",categories:["Маркетинг","Услуги"],image:"/app-assets/housewarming-party.png",joinedAt:"2024-11-02",bio:"Создаёт бренды для компаний Казахстана.",useful:"Брендинг и продвижение",request:"Проекты в HoReCa и недвижимости",website:"aline.kz",instagram:"@aline.studio",telegram:"@alinaserikova",companies:["Aline Studio"],score:850,attended:24,registered:27,cancelled:3,posts:8,comments:41 },
  { id:"andrey",name:"Андрей Лорико",company:"Lorico Group",role:"CEO",city:"Алматы",categories:["Строительство","Недвижимость"],image:"/app-assets/evelyn-hero.png",joinedAt:"2024-02-18",bio:"Предприниматель и организатор клубных встреч.",useful:"Девелопмент и партнёрства",request:"Инвесторы и земельные участки",website:"lorico.group",instagram:"@andrey.lorico",telegram:"@lorico",companies:["Lorico Group","Grand Cosmopolitan"],score:1720,attended:34,registered:38,cancelled:4,posts:12,comments:67 },
  { id:"madina",name:"Мадина Ким",company:"Kim Capital",role:"Управляющий партнёр",city:"Астана",categories:["Инвестиции","Финансы"],image:"/app-assets/housewarming-party.png",joinedAt:"2025-01-10",bio:"Инвестирует в технологические компании.",useful:"Инвестиции и финансовая модель",request:"Сильные IT-команды",website:"kim.capital",instagram:"@madina.kim",telegram:"@madinakim",companies:["Kim Capital"],score:1180,attended:19,registered:22,cancelled:3,posts:6,comments:28 },
  { id:"timur",name:"Тимур Алиев",company:"TA Logistics",role:"Основатель",city:"Шымкент",categories:["Логистика","Производство"],image:"/app-assets/evelyn-hero.png",joinedAt:"2025-06-20",bio:"Строит логистическую сеть по Центральной Азии.",useful:"Перевозки и складская логистика",request:"Клиенты с регулярными поставками",website:"talogistics.kz",instagram:"@ta.logistics",telegram:"@timuraliev",companies:["TA Logistics"],score:590,attended:16,registered:18,cancelled:2,posts:4,comments:19 },
];

export const events: ClubEvent[] = [
  {id:"housewarming",title:"Новоселье BURN",description:"Тёплая встреча резидентов: знакомства, музыка, закуски и общение.",day:2,date:"2 сентября 2026",time:"20:00",city:"Алматы",place:"Кабанбай батыра, 155",organizerId:"andrey",capacity:40,attendees:["alina","andrey","madina","timur"],price:15000,image:"/app-assets/housewarming-party.png",categories:["Нетворкинг"]},
  {id:"breakfast",title:"Бизнес-завтрак",description:"Разбор стратегии роста и обмен практическими кейсами.",day:5,date:"5 сентября 2026",time:"09:00",city:"Алматы",place:"Grand Cosmopolitan",organizerId:"alina",capacity:24,attendees:["evelyn","andrey"],price:25000,image:"/app-assets/evelyn-hero.png",categories:["Бизнес"]},
  {id:"board",title:"Совет директоров",description:"Закрытая работа с запросами резидентов.",day:10,date:"10 сентября 2026",time:"18:00",city:"Астана",place:"BURN Astana",organizerId:"madina",capacity:16,attendees:["madina"],price:0,image:"/app-assets/housewarming-party.png",categories:["Совет директоров"]},
  {id:"football",title:"Футбол BURN",description:"Спортивная встреча резидентов.",day:14,date:"14 сентября 2026",time:"20:30",city:"Шымкент",place:"Central Arena",organizerId:"timur",capacity:30,attendees:["timur"],price:0,image:"/app-assets/evelyn-hero.png",categories:["Спорт"]},
  {id:"family",title:"Семейный день",description:"Большой семейный праздник сообщества.",day:22,date:"22 сентября 2026",time:"12:00",city:"Алматы",place:"Esentai Park",organizerId:"andrey",capacity:80,attendees:["alina","evelyn"],price:10000,image:"/app-assets/housewarming-party.png",categories:["Семья"]},
];

export const initialWins: WinPost[] = [
  {id:"win-1",authorId:"alina",text:"Открыли новое направление и подписали первых трёх клиентов. Спасибо BURN за рекомендации!",images:["/app-assets/housewarming-party.png"],date:"Сегодня",likes:["andrey","madina"],fire:["timur"],comments:[{id:"c1",authorId:"andrey",text:"Сильный результат, поздравляю!",date:"Сегодня"}],status:"published"},
  {id:"win-2",authorId:"andrey",text:"Организатор года — награда сообщества за вклад в объединение резидентов.",images:["/app-assets/evelyn-hero.png"],date:"Вчера",likes:["alina","madina","timur"],fire:["evelyn"],comments:[],status:"published",official:true},
  {id:"win-3",authorId:"madina",text:"Закрыли инвестиционный раунд и начали подготовку нового проекта в Астане.",images:[],date:"3 дня назад",likes:["alina","evelyn"],fire:["andrey"],comments:[],status:"published"},
  {id:"win-4",authorId:"timur",text:"Команда вышла в новый регион и заключила первый крупный контракт в Шымкенте.",images:[],date:"5 дней назад",likes:["andrey"],fire:["alina","madina"],comments:[],status:"published"},
];

export const privileges: Privilege[] = [
  {id:"golden",company:"Golden Lab",residentId:"andrey",title:"Оборудование для бизнеса",description:"Специальные условия для резидентов BURN",benefit:"–15%",city:"Алматы",category:"Услуги",logo:"GL"},
  {id:"audit",company:"Kim Capital",residentId:"madina",title:"Финансовый аудит",description:"Первая стратегическая консультация",benefit:"Бесплатно",city:"Астана",category:"Финансы",logo:"KC"},
  {id:"brand",company:"Aline Studio",residentId:"alina",title:"Экспресс-разбор бренда",description:"Разбор позиционирования и визуальной системы",benefit:"–20%",city:"Алматы",category:"Маркетинг",logo:"AS"},
];

export const initialNotifications: NotificationItem[] = [
  {id:"n1",type:"event",title:"До мероприятия осталось 2 часа",body:"Новоселье BURN сегодня в 20:00",date:"Сегодня",read:false},
  {id:"n2",type:"rating",title:"До TOP-10 осталось 50 баллов",body:"Посетите ближайшее мероприятие",date:"Сегодня",read:false},
  {id:"n3",type:"membership",title:"Членство заканчивается через 30 дней",body:"Продлите членство без потери текущего срока",date:"Вчера",read:true},
];

export const scoreRules = { visit:100, organize:300, publish:30, comment:5, receivedLike:1, board:180 };
export function levelFor(score:number):ActivityLevel { if(score>=3000)return "BURN LEADER"; if(score>=1500)return "BURN PRO"; if(score>=500)return "BURN ACTIVE"; return "BURN START"; }
