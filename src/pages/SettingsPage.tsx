import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updatePassword, updateProfile } from '@/api/profile';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/utils';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'JPY', 'CHF', 'CNY', 'MYR'];

function getCroppedBlob(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX  = image.naturalWidth  / image.width;
  const scaleY  = image.naturalHeight / image.height;
  canvas.width  = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9));
}

function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name,     setName]     = useState(user?.name ?? '');
  const [mobile,   setMobile]   = useState(user?.mobile ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'INR');
  const [isSavingProfile,   setIsSavingProfile]   = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [isSavingPw, setIsSavingPw] = useState(false);

  // Avatar crop
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imgSrc,  setImgSrc]  = useState('');
  const [crop,    setCrop]    = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U';

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await updateProfile({ name, mobile: mobile || undefined, currency });
      updateUser(updated);
      toast.success('Profile updated.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsSavingProfile(false); }
  };

  const handleSavePassword = async () => {
    if (newPw !== confirmPw) { toast.error('Passwords do not match.'); return; }
    setIsSavingPw(true);
    try {
      await updatePassword({ current_password: currentPw, password: newPw, password_confirmation: confirmPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      toast.success('Password updated.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsSavingPw(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImgSrc(reader.result as string); setCropDialogOpen(true); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const c = centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, width, height), width, height);
    setCrop(c);
  };

  const handleSaveAvatar = async () => {
    if (!imgRef.current || !crop) return;
    setIsSavingAvatar(true);
    try {
      const blob = await getCroppedBlob(imgRef.current, crop as Required<Crop>);
      const formData = new FormData();
      formData.append('name',    name);
      formData.append('currency', currency);
      formData.append('profile_picture', blob, 'avatar.jpg');
      const updated = await updateProfile(formData);
      updateUser(updated);
      setCropDialogOpen(false);
      toast.success('Avatar updated.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsSavingAvatar(false); }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Avatar */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold mb-4">Profile Picture</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20">
              {user?.profile_picture && <AvatarImage src={user.profile_picture} />}
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Profile</h2>
        <div className="space-y-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-1">
          <Label>Mobile</Label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 ..." />
        </div>
        <div className="space-y-1">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
          {isSavingProfile ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Password */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Change Password</h2>
        <div className="space-y-1">
          <Label>Current Password</Label>
          <PasswordInput value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>New Password</Label>
          <PasswordInput value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Confirm New Password</Label>
          <PasswordInput value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
        </div>
        <Button onClick={handleSavePassword} disabled={isSavingPw}>
          {isSavingPw ? 'Updating...' : 'Update Password'}
        </Button>
      </div>

      {/* Avatar crop dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Crop Profile Picture</DialogTitle></DialogHeader>
          <div className="mt-3 flex justify-center">
            {imgSrc && (
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={1} circularCrop>
                <img ref={imgRef} src={imgSrc} alt="Crop preview" onLoad={onImageLoad} className="max-h-[400px]" />
              </ReactCrop>
            )}
          </div>
          <Button className="mt-4 w-full" onClick={handleSaveAvatar} disabled={isSavingAvatar}>
            {isSavingAvatar ? 'Saving...' : 'Save Avatar'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettingsPage;
