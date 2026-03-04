import Dashboard from '@/components/Dashboard';
import ChatAgent from '@/components/ChatAgent';
import { getDictionary } from '@/get-dictionary';

export default async function Home({ params: { lang } }: { params: { lang: string } }) {
  const dict = await getDictionary(lang);

  return (
    <>
      <Dashboard dict={dict.dashboard} lang={lang} />
      <ChatAgent dict={dict.chatAgent} lang={lang} />
    </>
  );
}
