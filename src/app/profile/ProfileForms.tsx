"use client";

import { useState, useRef } from "react";
import { updateProfile, updatePassword } from "./actions";
import { compressImageDetailed } from "@/lib/image";
import { IMAGE_PRESETS } from "@/lib/image-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Image as ImageIcon, Key, Mail, Shield, Upload } from "lucide-react";

export function ProfileForms({
  profile,
  sellerProfile,
}: {
  profile: any;
  sellerProfile: any;
}) {
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Avatar Upload State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cover Upload State
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url ?? null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (profile.display_name) {
      return profile.display_name.substring(0, 2).toUpperCase();
    }
    return profile.email.substring(0, 2).toUpperCase();
  };

  // Handle Avatar File Upload
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

  // Handle Cover File Upload
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
    // Explicitly set the avatar and cover Base64
    formData.set("avatarUrl", avatarPreview ?? "");
    formData.set("coverUrl", coverPreview ?? "");

    try {
      await updateProfile(formData);
      setProfileSuccess("Profil Anda berhasil diperbarui!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Terjadi kesalahan saat memperbarui profil.");
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
    } catch (err: any) {
      setPasswordError(err.message || "Gagal memperbarui kata sandi.");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Info and Avatar Card */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
          <div 
            className="relative h-28 bg-cover bg-center flex items-end px-6 pb-4 border-b border-border/40"
            style={{
              backgroundColor: "color-mix(in oklch, var(--primary) 16%, transparent)",
              backgroundImage: coverPreview ? `url(${coverPreview})` : "none",
            }}
          >
            {/* Clickable Profile Avatar to select from gallery */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-10 left-6 h-20 w-20 rounded-2xl border-2 border-border bg-popover shadow-xl overflow-hidden flex items-center justify-center bg-cover bg-center cursor-pointer group/avatar hover:border-primary transition-all duration-300"
              style={{
                backgroundImage: avatarPreview ? `url(${avatarPreview})` : "none",
              }}
            >
              {!avatarPreview && (
                <span className="text-xl font-black text-primary tracking-wider group-hover/avatar:opacity-0 transition-opacity">
                  {getInitials()}
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300">
                <Upload className="h-5 w-5" />
                <span className="text-[8px] font-bold mt-1">Ubah Foto</span>
              </div>
            </div>
            
            {/* Camera icon in the corner to upload cover */}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-3 right-3 h-7 px-2.5 rounded-lg border border-border/60 bg-background/50 backdrop-blur text-[10px] font-bold text-white hover:bg-background/80 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" /> {uploadingCover ? "Mengompresi..." : "Ubah Sampul"}
            </button>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <CardContent className="pt-14 pb-6 px-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {profile.display_name || "Pengguna Baru"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  profile.role === "admin"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : profile.role === "seller"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  <Shield className="h-3 w-3" /> {profile.role}
                </span>

                {profile.role === "seller" && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    sellerProfile?.verification_status === "approved"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {sellerProfile?.verification_status === "approved" ? (
                      <>
                        <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                        Verified Seller
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" x2="12" y1="8" y2="12" />
                          <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        Pending Verification
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <span>{profileError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> Alamat Email
                  </Label>
                  <Input
                    id="email"
                    disabled
                    value={profile.email}
                    className="h-10 rounded-xl px-4 border-border bg-background/20 text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Nama Tampilan
                  </Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    defaultValue={profile.display_name ?? ""}
                    placeholder="misal: KVIBOY Premium"
                    className="h-10 rounded-xl px-4 border-border bg-background/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nomor Telepon (Opsional)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile.phone ?? ""}
                    placeholder="misal: 08123456789"
                    className="h-10 rounded-xl px-4 border-border bg-background/50"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2 border-t border-border/20 pt-4">
                <Button
                  type="submit"
                  disabled={loadingProfile || uploadingAvatar}
                  className="h-10 rounded-xl font-bold px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 cursor-pointer"
                >
                  {loadingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Security Card */}
      <div className="flex flex-col gap-6">
        <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-primary" /> Keamanan Akun
            </CardTitle>
            <CardDescription>
              Ubah kata sandi akun Anda secara berkala.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4.5">
              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Kata Sandi Baru
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-10 rounded-xl px-4 border-border bg-background/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Konfirmasi Kata Sandi
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-10 rounded-xl px-4 border-border bg-background/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loadingPassword}
                variant="outline"
                className="h-10 w-full rounded-xl font-bold hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                {loadingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
