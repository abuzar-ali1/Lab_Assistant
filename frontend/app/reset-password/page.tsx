import ResetPasswordForm from "@/Components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; token?: string }>;
}) {
  const params = await searchParams;
  return <ResetPasswordForm uid={params.uid || ""} token={params.token || ""} />;
}
