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
      {
        id: 1,
        name: { en: 'Dr. Evelyn Reed', ar: 'د. إيفلين ريد' },
        role: { en: 'Pain Management Specialist', ar: 'أخصائية إدارة الألم' },
        image: 'assets/team/doctor-1.jpg'
      },
      {
        id: 2,
        name: { en: 'Dr. Marcus Thorne', ar: 'د. ماركوس ثورن' },
        role: { en: 'Anesthesiologist', ar: 'طبيب تخدير' },
        image: 'assets/team/doctor-2.jpg'
      },
      {
        id: 3,
        name: { en: 'Dr. Jian Li', ar: 'د. جيان لي' },
        role: { en: 'Physical Therapist', ar: 'أخصائية علاج طبيعي' },
        image: 'assets/team/doctor-3.jpg'
      },
      {
        id: 4,
        name: { en: 'Dr. Samuel Chen', ar: 'د. صامويل تشين' },
        role: { en: 'Neurologist', ar: 'طبيب أعصاب' },
        image: 'assets/team/doctor-4.jpg'
      },
      {
        id: 5,
        name: { en: 'Dr. Fatima Al-Jamil', ar: 'د. فاطمة الجميل' },
        role: { en: 'Rheumatologist', ar: 'طبيبة أمراض الروماتيزم' },
        image: 'assets/team/doctor-5.jpg'
      },
      {
        id: 6,
        name: { en: 'Alex Rivera', ar: 'أليكس ريفيرا' },
        role: { en: 'Clinic Manager', ar: 'مدير العيادة' },
        image: 'assets/team/staff-1.jpg'
      },
      {
        id: 7,
        name: { en: 'Maria Garcia', ar: 'ماريا غارسيا' },
        role: { en: 'Lead Nurse', ar: 'رئيسة الممرضين' },
        image: 'assets/team/staff-2.jpg'
      }
    ];
  }

  getServices() {
    return [
      {
        title: { en: 'Interventional Pain Management', ar: 'إدارة الألم التداخلية' },
        description: { en: 'Minimally invasive procedures like nerve blocks and epidural injections to treat chronic pain.', ar: 'إجراءات طفيفة التوغل مثل إحصار الأعصاب وحقن فوق الجافية لعلاج الألم المزمن.' },
        image: 'assets/services/service-1.jpg'
      },
      {
        title: { en: 'Physical Therapy', ar: 'العلاج الطبيعي' },
        description: { en: 'Customized exercise programs to restore function, improve mobility, and reduce pain.', ar: 'برامج تمارين مخصصة لاستعادة الوظائف وتحسين الحركة وتقليل الألم.' },
        image: 'assets/services/service-2.jpg'
      },
      {
        title: { en: 'Medication Management', ar: 'إدارة الأدوية' },
        description: { en: 'Comprehensive evaluation and management of pain medications to ensure safety and efficacy.', ar: 'تقييم وإدارة شاملة لأدوية الألم لضمان السلامة والفعالية.' },
        image: 'assets/services/service-3.jpg'
      },
      {
        title: { en: 'Acupuncture', ar: 'الوخز بالإبر' },
        description: { en: 'Traditional techniques to stimulate specific points on the body, releasing endorphins and relieving pain.', ar: 'تقنيات تقليدية لتحفيز نقاط معينة في الجسم، وإطلاق الإندورفين وتخفيف الألم.' },
        image: 'assets/services/service-4.jpg'
      }
    ];
  }

}