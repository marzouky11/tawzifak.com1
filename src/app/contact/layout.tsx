import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتصل بنا - تواصل مع فريق توظيفك',
  description: 'لديك سؤال، اقتراح، أو تحتاج إلى مساعدة؟ تواصل مع فريق دعم منصة توظيفك. نحن هنا للاستماع إليك والرد على جميع استفساراتك.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
