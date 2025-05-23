import AuthForm from '@/components/auth-form';

export default async function Home({searchParams}) {
  const formMode = searchParams.mode;
  return <AuthForm formMode={formMode} />;
}
