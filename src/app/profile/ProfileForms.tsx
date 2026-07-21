"use client";

import { useState, useRef } from "react";
import { updateProfile, updatePassword } from "./actions";
import { compressImageDetailed } from "@/lib/image";
import { IMAGE_PRESETS } from "@/lib/image-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Key, Mail, Shield, Upload } from "lucide-react";

type ProfileData = {
  id: string;
  email: string;
  phone?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  role?: string | null;
  kyc_status?: string | null;
};

type SellerProfileData = {
  verification_status?: string | null;
} | null;

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function ProfileForms({
  profile,
  sellerProfile,
}: {
  profile: ProfileData;
  sellerProfile: SellerProfileData;
}) {
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url ?? null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (profile.display_name) {
      return profile.display_name.substring(0, 2).toUpperCase();
    }
    return profile.email.substring(0, 2).toUpperCase();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { dataUrl: base64Data } = await compressImageDetailed(file, IMAGE_PRESETS.avatar);
      setAvatarPreview(base64Data);
    } catch (err) {
      console.error("Gagal mengompresi gambar:", err);
      setProfileError("Gagal mengunggah foto profil dari galeri.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const { dataUrl: base64Data } = await compressImageDetailed(file, IMAGE_PRESETS.cover);
      setCoverPreview(base64Data);
    } catch (err) {
      console.error("Gagal mengompresi gambar sampul:", err);
      setProfileError("Gagal mengunggah foto sampul dari galeri.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoadingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("avatarUrl", avatarPreview ?? "");
    formData.set("coverUrl", coverPreview ?? "");

    try {
      await updateProfile(formData);
      setProfileSuccess("Profil Anda berhasil diperbarui!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: unknown) {
      setProfileError(errorMessage(err, "Terjadi kesalahan saat memperbarui profil."));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await updatePassword(formData);
      setPasswordSuccess("Kata sandi berhasil diubah!");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: unknown) {
      setPasswordError(errorMessage(err, "Gagal memperbarui kata sandi."));
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
          <div
            className="relative h-28 bg-cover bg-center flex items-end px-6 pb-4 border-b border-border/40"
            style={{
              backgroundColor: "color-mix(in oklch, var(--primary) 16%, transparent)",
              backgroundImage: coverPreview ? `url(${coverPreview})` : "none",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            <div className="relative flex items-end gap-4 w-full">
              <div
                className="h-16 w-16 rounded-2xl border-2 border-background bg-cover bg-center flex items-center justify-center text-sm font-bold shadow-lg shrink-0"
                style={{
                  backgroundImage: avatarPreview ? `url(${avatarPreview})` : undefined,
                  backgroundColor: avatarPreview
                    ? undefined
                    : "color-mix(in oklch, var(--primary) 30%, transparent)",
                }}
              >
                {!avatarPreview && getInitials()}
              </div>
              <div className="pb-1 min-w-0">
                <p className="font-bold text-foreground truncate">
                  {profile.display_name || "Pengguna"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
              <div className="ml-auto flex gap-2 pb-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg text-xs"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {uploadingCover ? "..." : "Cover"}
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Data Profil
            </CardTitle>
            <CardDescription>Perbarui nama, nomor HP, dan foto akun Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="displayName">Nama Tampilan</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={profile.display_name ?? ""}
                  placeholder="Nama panggilan"
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile.phone ?? ""}
                  placeholder="08xxxxxxxxxx"
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  {uploadingAvatar ? "Mengompresi..." : "Ganti Foto Profil"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              {profileSuccess && (
                <p className="text-sm text-green-500 font-medium">{profileSuccess}</p>
              )}
              {profileError && (
                <p className="text-sm text-destructive font-medium">{profileError}</p>
              )}
              <Button
                type="submit"
                disabled={loadingProfile || uploadingAvatar || uploadingCover}
                className="h-10 rounded-xl font-semibold"
              >
                {loadingProfile ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Ubah Kata Sandi
            </CardTitle>
            <CardDescription>Minimal 8 karakter. Gunakan sandi yang unik.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Kata Sandi Baru</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="h-10 rounded-xl"
                />
              </div>
              {passwordSuccess && (
                <p className="text-sm text-green-500 font-medium">{passwordSuccess}</p>
              )}
              {passwordError && (
                <p className="text-sm text-destructive font-medium">{passwordError}</p>
              )}
              <Button
                type="submit"
                disabled={loadingPassword}
                className="h-10 rounded-xl font-semibold"
              >
                {loadingPassword ? "Mengubah..." : "Ubah Kata Sandi"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="border-border bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm break-all">{profile.email}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" /> Status Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Peran: <span className="font-semibold capitalize">{profile.role ?? "buyer"}</span>
            </p>
            <p>
              KYC:{" "}
              <span className="font-semibold">{profile.kyc_status ?? "unverified"}</span>
            </p>
            {sellerProfile?.verification_status && (
              <p>
                Penjual:{" "}
                <span className="font-semibold">{sellerProfile.verification_status}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
