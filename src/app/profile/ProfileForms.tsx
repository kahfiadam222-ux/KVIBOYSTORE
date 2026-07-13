"use client";

import { useState, useRef } from "react";
import { updateProfile, updatePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Image as ImageIcon, Key, Mail, Shield, Upload } from "lucide-react";

function compressImage(file: any, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

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

  // WhatsApp Verification State
  const [phoneNumber, setPhoneNumber] = useState(profile.phone ?? "");
  const [isPhoneVerified, setIsPhoneVerified] = useState(!!profile.phone);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [whatsappInfo, setWhatsappInfo] = useState<string | null>(null);

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
      const base64Data = await compressImage(file, 200, 200, 0.85);
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
      // Compress cover banner image (wider aspect ratio)
      const base64Data = await compressImage(file, 1200, 300, 0.75);
      setCoverPreview(base64Data);
    } catch (err) {
      console.error("Gagal mengompresi gambar sampul:", err);
      setProfileError("Gagal mengunggah foto sampul dari galeri.");
    } finally {
      setUploadingCover(false);
    }
  };

  // WhatsApp verification helper
  const sendWhatsAppOtp = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setWhatsappError("Masukkan nomor telepon/WhatsApp yang valid.");
      return;
    }
    setWhatsappError(null);
    setWhatsappInfo(null);

    // Generate random 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);

    // Mock alert to user
    setWhatsappInfo(`[WhatsApp Simulator] Kode OTP dikirim ke ${phoneNumber}. Kode verifikasi Anda: ${otp}`);
  };

  const verifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      setIsPhoneVerified(true);
      setOtpSent(false);
      setGeneratedOtp(null);
      setWhatsappInfo(null);
      setWhatsappError(null);
    } else {
      setWhatsappError("Kode OTP salah. Silakan coba lagi.");
    }
  };

  const resetPhoneVerification = () => {
    setIsPhoneVerified(false);
    setOtpSent(false);
    setGeneratedOtp(null);
    setEnteredOtp("");
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isPhoneVerified && phoneNumber !== "") {
      setProfileError("Silakan verifikasi nomor WhatsApp Anda terlebih dahulu.");
      return;
    }

    setLoadingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    const formData = new FormData(e.currentTarget);
    // Explicitly set the avatar, cover Base64 and the verified phone number
    formData.set("avatarUrl", avatarPreview ?? "");
    formData.set("coverUrl", coverPreview ?? "");
    formData.set("phone", isPhoneVerified ? phoneNumber : "");

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
              backgroundImage: coverPreview 
                ? `url(${coverPreview})` 
                : "linear-gradient(to right, color-mix(in oklch, var(--primary) 30%, transparent), color-mix(in oklch, var(--primary) 10%, transparent))",
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

                {/* WhatsApp Phone Link & Verification Section */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Nomor Telepon (Verifikasi WhatsApp)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      value={phoneNumber}
                      disabled={isPhoneVerified}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="misal: 08123456789"
                      className={`h-10 rounded-xl px-4 border-border bg-background/50 flex-1 ${
                        isPhoneVerified ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/30" : ""
                      }`}
                    />
                    {isPhoneVerified ? (
                      <Button
                        type="button"
                        onClick={resetPhoneVerification}
                        variant="outline"
                        className="h-10 rounded-xl font-bold border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer px-4"
                      >
                        Ubah Nomor
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={sendWhatsAppOtp}
                        className="h-10 rounded-xl font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground cursor-pointer px-4"
                      >
                        Kirim OTP
                      </Button>
                    )}
                  </div>

                  {/* Simulator Info Textbox */}
                  {whatsappInfo && (
                    <div className="mt-2 text-xs text-primary bg-primary/10 border border-primary/20 p-2.5 rounded-lg flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>{whatsappInfo}</span>
                    </div>
                  )}

                  {/* OTP Entry fields */}
                  {otpSent && (
                    <div className="mt-3 bg-background/30 border border-border p-3.5 rounded-xl flex flex-col gap-2.5">
                      <Label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Masukkan 6-Digit Kode OTP WhatsApp
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="otp"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          placeholder="Ketik kode OTP..."
                          maxLength={6}
                          className="h-9 rounded-lg border-border text-center tracking-widest font-mono text-sm bg-background/40 w-40"
                        />
                        <Button
                          type="button"
                          onClick={verifyOtp}
                          className="h-9 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-600 cursor-pointer px-4"
                        >
                          Verifikasi
                        </Button>
                      </div>
                      {whatsappError && (
                        <p className="text-[11px] text-red-400 font-medium">{whatsappError}</p>
                      )}
                    </div>
                  )}

                  {isPhoneVerified && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      Nomor telah terverifikasi via WhatsApp.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-2 border-t border-border/20 pt-4">
                <Button
                  type="submit"
                  disabled={loadingProfile || uploadingAvatar || (!isPhoneVerified && phoneNumber !== "")}
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
