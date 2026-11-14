"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Award } from "lucide-react";
import { ApiError, listResultImages, uploadResultImage, type ResultImageRecord } from "@/lib/sems-api";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminPageIntro, AdminPanel, adminFieldClass } from "../shared/fields";

function sessionToken() {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem("sems-auth-v1");
    const parsed = raw ? (JSON.parse(raw) as { token?: string }) : null;
    return parsed?.token || "";
  } catch {
    return "";
  }
}

function monthLabel(month: string) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText);
  if (!year || !monthIndex) return month;
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function ResultsPage() {
  const { role, students, classes, portalStudentId, portalAccount } = useAdmin();
  const canUpload = portalAccount === "staff" || role === "super_admin" || role === "institution_admin" || role === "teacher";
  const classNames = [...new Set(classes.map((room) => room.name.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  const [tab, setTab] = useState<"upload" | "view">(canUpload ? "upload" : "view");
  const [imageClass, setImageClass] = useState("");
  const [imageSection, setImageSection] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageNotice, setImageNotice] = useState("");
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const [resultImages, setResultImages] = useState<ResultImageRecord[]>([]);
  const imageSections = [...new Set(classes.filter((room) => room.name === imageClass).map((room) => room.section.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  const signedStudent = students.find((student) => student.id === portalStudentId);
  const visibleImages =
    role === "student"
      ? resultImages.filter((image) => image.className.trim().toLowerCase() === (signedStudent?.className || "").trim().toLowerCase() && image.section.trim().toLowerCase() === (signedStudent?.section || "").trim().toLowerCase())
      : canUpload
        ? resultImages
        : [];

  useEffect(() => {
    const token = sessionToken();
    if (!token) return;
    let active = true;
    listResultImages(token)
      .then((rows) => {
        if (active) setResultImages(rows);
      })
      .catch(() => {
        if (active) setResultImages([]);
      });
    return () => {
      active = false;
    };
  }, []);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setImageError("");
    setImageNotice("");
  }

  async function submitImage(event: FormEvent) {
    event.preventDefault();
    if (!imageClass || !imageSection) {
      setImageError("Choose a class and a section.");
      return;
    }
    if (!imageFile) {
      setImageError("Choose an image file.");
      return;
    }
    if (imageFile.type && !imageFile.type.startsWith("image/")) {
      setImageError("Choose an image file.");
      return;
    }
    const token = sessionToken();
    if (!token) {
      setImageError("Log in as a teacher, staff member, or the institution owner to store the result image.");
      return;
    }
    setUploading(true);
    setImageError("");
    setImageNotice("");
    try {
      const saved = await uploadResultImage(token, imageClass, imageSection, imageFile);
      setResultImages((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setImageFile(null);
      if (imageInput.current) imageInput.current.value = "";
      setImageNotice("Result image saved.");
    } catch (error) {
      setImageError(error instanceof ApiError ? error.message : "Could not store the result image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <AdminPageIntro
        icon={Award}
        eyebrow="Academics"
        title="Results"
        description={canUpload ? "Upload a result image for a class and section. Students in that class can open it from View result." : "Result images for your class and section."}
      />
      {canUpload ? (
        <div className="flex gap-2">
          <button type="button" className={tab === "upload" ? "rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white" : "rounded-xl bg-[var(--admin-surface)] px-4 py-2 text-sm font-semibold ring-1 ring-[var(--admin-line)]"} onClick={() => setTab("upload")}>
            Upload result
          </button>
          <button type="button" className={tab === "view" ? "rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white" : "rounded-xl bg-[var(--admin-surface)] px-4 py-2 text-sm font-semibold ring-1 ring-[var(--admin-line)]"} onClick={() => setTab("view")}>
            View result
          </button>
        </div>
      ) : null}
      {canUpload && tab === "upload" ? (
        <AdminPanel>
          <form className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={submitImage}>
            <AdminField id="result-image-class" label="Class">
              <select
                id="result-image-class"
                className={adminFieldClass}
                value={imageClass}
                onChange={(event) => {
                  setImageClass(event.target.value);
                  setImageSection("");
                }}
              >
                <option value="">Select a class</option>
                {classNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </AdminField>
            <AdminField id="result-image-section" label="Section">
              <select id="result-image-section" className={adminFieldClass} value={imageSection} onChange={(event) => setImageSection(event.target.value)}>
                <option value="">Select a section</option>
                {imageSections.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </AdminField>
            <AdminField id="result-image-file" label="Upload image">
              <input id="result-image-file" ref={imageInput} type="file" accept="image/*" className={adminFieldClass} onChange={chooseImage} />
            </AdminField>
            <AdminButton type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload image"}
            </AdminButton>
          </form>
          <p className="mt-3 text-xs text-[var(--admin-muted)]">Students in this class and section can view the image. It is removed automatically after two months.</p>
          {imageNotice ? <p className="mt-2 text-sm text-[#1f7a45]">{imageNotice}</p> : null}
          {imageError ? <p className="mt-2 text-sm text-[#a3361f]">{imageError}</p> : null}
        </AdminPanel>
      ) : null}
      {!canUpload || tab === "view" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleImages.map((image) => (
            <AdminPanel key={image.id}>
              <p className="text-sm font-semibold">
                {image.className} · {image.section}
              </p>
              <p className="text-xs text-[var(--admin-muted)]">{monthLabel(image.month)}</p>
              <img src={image.imageUrl} alt={`${image.className} ${image.section} result`} className="mt-3 max-h-[32rem] w-full rounded-xl object-contain" />
            </AdminPanel>
          ))}
          {visibleImages.length === 0 ? <AdminPanel>No result image for this class yet.</AdminPanel> : null}
        </div>
      ) : null}
    </div>
  );
}
