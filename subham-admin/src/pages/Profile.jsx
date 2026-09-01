/** Admin profile and password change (credentials live in the database). */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { FiKey, FiSave, FiShield } from 'react-icons/fi';
import api, { tokenStore } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dateTime } from '../lib/format';
import { Field, Input, PageHeader, SectionCard, Spinner } from '../components/Ui';

export default function Profile() {
  const { admin, setAdmin } = useAuth();
  const toast = useToast();

  const profileForm = useForm({ defaultValues: { name: '', username: '', email: '', phone: '' } });
  const passwordForm = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  useEffect(() => {
    if (admin) {
      profileForm.reset({
        name: admin.name || '',
        username: admin.username || '',
        email: admin.email || '',
        phone: admin.phone || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const profileMutation = useMutation({
    mutationFn: (values) => api.updateProfile(values),
    onSuccess: (updated) => { setAdmin(updated); toast('Profile updated'); },
    onError: (err) => toast(err.message, 'error'),
  });

  const passwordMutation = useMutation({
    mutationFn: (values) => api.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: (res) => {
      if (res.token) tokenStore.set(res.token);
      toast('Password changed — other sessions have been signed out');
      passwordForm.reset();
    },
    onError: (err) => toast(err.message, 'error'),
  });

  return (
    <>
      <PageHeader title="My profile" subtitle="There is a single admin account. Credentials are stored in the database and editable here." />

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Account details">
          <form onSubmit={profileForm.handleSubmit((v) => profileMutation.mutate(v))} className="grid gap-4">
            <Field label="Display name" error={profileForm.formState.errors.name}>
              <Input {...profileForm.register('name', { required: 'Name is required' })} />
            </Field>
            <Field label="Username" required error={profileForm.formState.errors.username} hint="This is what you sign in with.">
              <Input {...profileForm.register('username', { required: 'Username is required', minLength: { value: 3, message: 'At least 3 characters' } })} />
            </Field>
            <Field label="Email"><Input type="email" {...profileForm.register('email')} /></Field>
            <Field label="Phone"><Input {...profileForm.register('phone')} /></Field>

            <button type="submit" disabled={profileMutation.isPending} className="btn-primary mt-1 justify-self-start gap-2">
              {profileMutation.isPending ? <Spinner size={14} /> : <FiSave size={15} />} Save profile
            </button>
          </form>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Change password">
            <form
              onSubmit={passwordForm.handleSubmit((v) => {
                if (v.newPassword !== v.confirmPassword) {
                  passwordForm.setError('confirmPassword', { message: "Passwords don't match" });
                  return;
                }
                passwordMutation.mutate(v);
              })}
              className="grid gap-4"
            >
              <Field label="Current password" required error={passwordForm.formState.errors.currentPassword}>
                <Input type="password" autoComplete="current-password" {...passwordForm.register('currentPassword', { required: 'Required' })} />
              </Field>
              <Field label="New password" required error={passwordForm.formState.errors.newPassword} hint="At least 12 characters.">
                <Input type="password" autoComplete="new-password" {...passwordForm.register('newPassword', { required: 'Required', minLength: { value: 12, message: 'At least 12 characters' } })} />
              </Field>
              <Field label="Confirm new password" required error={passwordForm.formState.errors.confirmPassword}>
                <Input type="password" autoComplete="new-password" {...passwordForm.register('confirmPassword', { required: 'Required' })} />
              </Field>

              <button type="submit" disabled={passwordMutation.isPending} className="btn-primary mt-1 justify-self-start gap-2">
                {passwordMutation.isPending ? <Spinner size={14} /> : <FiKey size={15} />} Change password
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Security">
            <ul className="space-y-2.5 text-xs leading-relaxed text-ink-600">
              <li className="flex gap-2.5">
                <FiShield size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                Passwords are hashed with bcrypt (12 rounds). Changing your password immediately invalidates tokens
                issued before the change.
              </li>
              <li className="flex gap-2.5">
                <FiShield size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                Login is rate-limited to 10 attempts per 10 minutes per IP.
              </li>
              <li className="flex gap-2.5">
                <FiShield size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                There is no registration or password-reset endpoint — the account can only be changed from here or
                directly in the database.
              </li>
            </ul>

            <dl className="mt-4 grid gap-2 border-t border-ink-100 pt-4 text-2xs">
              <div className="flex justify-between"><dt className="text-ink-400">Role</dt><dd className="font-semibold text-ink-800">{admin?.role}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-400">Last sign-in</dt><dd className="font-semibold text-ink-800">{dateTime(admin?.lastLoginAt)}</dd></div>
            </dl>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
