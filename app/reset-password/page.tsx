import { title } from '@/components/primitives';
import ResetPassword from '@/components/Auth/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center mb-8">
        <h1 className={title()}>Reset Password</h1>
        <p className="mt-4 text-default-500">
          Forgot your password? No worries, we'll help you reset it.
        </p>
      </div>
      <ResetPassword />
    </div>
  );
}