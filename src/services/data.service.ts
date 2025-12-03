import { Injectable } from '@angular/core';

type Article = {
  id: number;
  title: {
    en: string;
    ar: string;
  };
  excerpt: {
    en: string;
    ar: string;
  };
  content: {
    en: string;
    ar: string;
  };
  date: {
    en: string;
    ar: string;
  };
};

@Injectable({ providedIn: 'root' })
export class DataService {
  getTeam() {
    return [
      { id: 1, name: 'Dr. Evelyn Reed', role: { en: 'Pain Management Specialist', ar: 'أخصائية إدارة الألم' }, image: 'https://picsum.photos/seed/doc1/200/200' },
      { id: 2, name: 'Dr. Marcus Thorne', role: { en: 'Anesthesiologist', ar: 'طبيب تخدير' }, image: 'https://picsum.photos/seed/doc2/200/200' },
      { id: 3, name: 'Dr. Jian Li', role: { en: 'Physical Therapist', ar: 'أخصائية علاج طبيعي' }, image: 'https://picsum.photos/seed/doc3/200/200' },
      { id: 4, name: 'Dr. Samuel Chen', role: { en: 'Neurologist', ar: 'طبيب أعصاب' }, image: 'https://picsum.photos/seed/doc4/200/200' },
      { id: 5, name: 'Dr. Fatima Al-Jamil', role: { en: 'Rheumatologist', ar: 'طبيبة أمراض الروماتيزم' }, image: 'https://picsum.photos/seed/doc5/200/200' },
      { id: 6, name: 'Alex Rivera', role: { en: 'Clinic Manager', ar: 'مدير العيادة' }, image: 'https://picsum.photos/seed/staff1/200/200' },
      { id: 7, name: 'Maria Garcia', role: { en: 'Lead Nurse', ar: 'رئيسة الممرضين' }, image: 'https://picsum.photos/seed/staff2/200/200' }
    ];
  }

  getServices() {
    return [
      { 
        title: { en: 'Interventional Pain Management', ar: 'إدارة الألم التداخلية' },
        description: { en: 'Minimally invasive procedures like nerve blocks and epidural injections to treat chronic pain.', ar: 'إجراءات طفيفة التوغل مثل إحصار الأعصاب وحقن فوق الجافية لعلاج الألم المزمن.' },
        image: 'https://picsum.photos/seed/service1/600/400'
      },
      { 
        title: { en: 'Physical Therapy', ar: 'العلاج الطبيعي' },
        description: { en: 'Customized exercise programs to restore function, improve mobility, and reduce pain.', ar: 'برامج تمارين مخصصة لاستعادة الوظائف وتحسين الحركة وتقليل الألم.' },
        image: 'https://picsum.photos/seed/service2/600/400'
      },
      { 
        title: { en: 'Medication Management', ar: 'إدارة الأدوية' },
        description: { en: 'Comprehensive evaluation and management of pain medications to ensure safety and efficacy.', ar: 'تقييم وإدارة شاملة لأدوية الألم لضمان السلامة والفعالية.' },
        image: 'https://picsum.photos/seed/service3/600/400'
      },
      { 
        title: { en: 'Acupuncture', ar: 'الوخز بالإبر' },
        description: { en: 'Traditional techniques to stimulate specific points on the body, releasing endorphins and relieving pain.', ar: 'تقنيات تقليدية لتحفيز نقاط معينة في الجسم، وإطلاق الإندورفين وتخفيف الألم.' },
        image: 'https://picsum.photos/seed/service4/600/400'
      }
    ];
  }

  getArticles(): Article[] {
    return Array.from({ length: 17 }, (_, i) => ({
      id: i + 1,
      title: { 
        en: `Understanding Chronic Pain: A Deep Dive ${i + 1}`,
        ar: `فهم الألم المزمن: نظرة عميقة ${i + 1}`
      },
      excerpt: {
        en: 'Chronic pain is a complex condition that affects millions. This article explores its causes, symptoms, and the latest treatment approaches...',
        ar: 'الألم المزمن حالة معقدة تؤثر على الملايين. يستكشف هذا المقال أسبابه وأعراضه وأحدث طرق العلاج...'
      },
      content: {
        en: 'This is the full content for the article about chronic pain. It delves deeper into the mechanisms of pain perception, the psychological impact of living with constant discomfort, and various therapeutic strategies. We will discuss everything from pharmacological interventions to alternative therapies like mindfulness and yoga. Our goal is to provide a comprehensive resource for patients and caregivers alike, empowering them with knowledge and hope. The journey to managing chronic pain is unique for each individual, and understanding the multifaceted nature of the condition is the first step towards finding effective relief and improving quality of life.',
        ar: 'هذا هو المحتوى الكامل للمقال حول الألم المزمن. يتعمق في آليات إدراك الألم ، والتأثير النفسي للعيش مع الانزعاج المستمر ، والاستراتيجيات العلاجية المختلفة. سنناقش كل شيء من التدخلات الدوائية إلى العلاجات البديلة مثل اليقظة واليوغا. هدفنا هو توفير مورد شامل للمرضى ومقدمي الرعاية على حد سواء ، وتمكينهم بالمعرفة والأمل. إن رحلة إدارة الألم المزمن فريدة لكل فرد ، وفهم الطبيعة المتعددة الأوجه للحالة هو الخطوة الأولى نحو إيجاد راحة فعالة وتحسين نوعية الحياة.'
      },
      date: {
        en: `October ${17-i}, 2024`,
        ar: `أكتوبر ${17-i}, 2024`
      }
    }));
  }

  getArticleById(id: number): Article | undefined {
    return this.getArticles().find(article => article.id === id);
  }
}