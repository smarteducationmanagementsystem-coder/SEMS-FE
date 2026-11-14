"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Settings } from "lucide-react";
import { displayLogo, emptyCampusLocation, type CampusLocation } from "../campus-data";
import { readDeviceLocation } from "@/lib/sems-api";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminPageIntro, AdminPanel, adminFieldClass } from "../shared/fields";

export function SettingsPage() {
  const { settings, updateSettings, saveSettings, uploadLogo, removeLogo } = useAdmin();
  const [logoError, setLogoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [capturing, setCapturing] = useState<"location1" | "location2" | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(await saveSettings());
  }

  async function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const imageExtension = ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg", "ico", "heic", "heif", "avif", "tif", "tiff", "jfif"].includes(extension);
    if (!file.type.startsWith("image/") && !imageExtension) {
      setLogoError("Choose an image file.");
      return;
    }
    if (file.size > 5_000_000) {
      setLogoError("Use an image smaller than 5 MB.");
      return;
    }
    setUploading(true);
    setLogoError(null);
    setLogoError(await uploadLogo(file));
    setUploading(false);
  }

  async function captureLocation(key: "location1" | "location2") {
    setCapturing(key);
    setFormError(null);
    const place = await readDeviceLocation();
    setCapturing(null);
    if ("error" in place) {
      setFormError("Enable location, then capture this place while you are standing there.");
      return;
    }
    const current = settings[key] ?? emptyCampusLocation;
    updateSettings({ [key]: { label: current.label, latitude: place.latitude, longitude: place.longitude } });
  }

  function setLocationLabel(key: "location1" | "location2", label: string) {
    const current = settings[key] ?? emptyCampusLocation;
    updateSettings({ [key]: { ...current, label } });
  }

  const logo = displayLogo(settings.logoUrl);
  const locationOn = settings.locationCheckEnabled === true;
  const location1 = settings.location1 ?? emptyCampusLocation;
  const location2 = settings.location2 ?? emptyCampusLocation;

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <AdminPageIntro
        icon={Settings}
        eyebrow="Campus"
        title="Settings"
        description="Institution profile shown across the campus."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => updateSettings({ locationCheckEnabled: true })} className={locationOn ? "inline-flex items-center rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-sm font-semibold text-white" : "inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 ring-[var(--admin-line)]"}>
              Enable location
            </button>
            <button type="button" onClick={() => updateSettings({ locationCheckEnabled: false })} className={!locationOn ? "inline-flex items-center rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-sm font-semibold text-white" : "inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 ring-[var(--admin-line)]"}>
              Disable location
            </button>
            <AdminButton type="submit">Save settings</AdminButton>
          </div>
        }
      />
      <AdminPanel>
        <h2 className="mb-4 font-semibold">Institution profile</h2>
        <div className="mb-4 flex items-center gap-4">
          <span
            className="size-16 shrink-0 rounded-full border border-[var(--admin-line)] bg-[var(--admin-surface-2)] bg-cover bg-center"
            style={logo ? { backgroundImage: `url("${logo}")` } : undefined}
            role="img"
            aria-label={logo ? `${settings.institutionName} logo` : "Empty institution logo"}
          />
          <div>
            <p className="text-sm font-medium">Institution logo</p>
            <p className="mt-1 text-xs text-[var(--admin-muted)]">Any image is stored in this institution's folder and shown on the portal, fee slips, and result sheets.</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer rounded-lg bg-[var(--admin-nav-active)] px-3 py-2 text-xs font-semibold">
                {uploading ? "Uploading..." : "Choose image"}
                <input type="file" accept="image/*" disabled={uploading} className="sr-only" onChange={handleLogo} />
              </label>
              {logo ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--admin-muted)]"
                  onClick={async () => {
                    setLogoError(await removeLogo());
                  }}
                >
                  Remove logo
                </button>
              ) : null}
            </div>
            {logoError ? <p className="mt-1 text-xs text-[#a3361f]">{logoError}</p> : null}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <p className="sm:col-span-2 text-sm text-[var(--admin-muted)]">
            {locationOn
              ? "Location check is on. Teachers and staff can sign in only from Location 1 or Location 2. Save settings to keep this."
              : "Location check is off. Teachers and staff can sign in from anywhere. Save settings to keep this."}{" "}
            Students and the owner can always sign in from anywhere.
          </p>
          <LocationField id="location1" label="Location 1" value={location1} capturing={capturing === "location1"} onLabel={(label) => setLocationLabel("location1", label)} onCapture={() => captureLocation("location1")} onClear={() => updateSettings({ location1: { ...emptyCampusLocation } })} />
          <LocationField id="location2" label="Location 2" value={location2} capturing={capturing === "location2"} onLabel={(label) => setLocationLabel("location2", label)} onCapture={() => captureLocation("location2")} onClear={() => updateSettings({ location2: { ...emptyCampusLocation } })} />
          <AdminField id="owner" label="Owner name"><input id="owner" className={adminFieldClass} value={settings.ownerName} onChange={(event) => updateSettings({ ownerName: event.target.value })} /></AdminField>
          <AdminField id="name" label="Institution name"><input id="name" className={adminFieldClass} value={settings.institutionName} onChange={(event) => updateSettings({ institutionName: event.target.value })} /></AdminField>
          <AdminField id="email" label="Email"><input id="email" type="email" className={adminFieldClass} value={settings.email} onChange={(event) => updateSettings({ email: event.target.value })} /></AdminField>
          <AdminField id="phone" label="Phone"><input id="phone" className={adminFieldClass} value={settings.phone} onChange={(event) => updateSettings({ phone: event.target.value })} /></AdminField>
          <AdminField id="city" label="City"><input id="city" className={adminFieldClass} value={settings.city} onChange={(event) => updateSettings({ city: event.target.value })} /></AdminField>
          <AdminField id="address" label="Address"><input id="address" className={adminFieldClass} value={settings.address} onChange={(event) => updateSettings({ address: event.target.value })} /></AdminField>
        </div>
        {formError ? <p className="mt-3 text-sm text-[#a3361f]">{formError}</p> : null}
      </AdminPanel>
    </form>
  );
}

function LocationField({
  id,
  label,
  value,
  capturing,
  onLabel,
  onCapture,
  onClear,
}: {
  id: string;
  label: string;
  value: CampusLocation;
  capturing: boolean;
  onLabel: (label: string) => void;
  onCapture: () => void;
  onClear: () => void;
}) {
  const pinned = value.latitude !== null && value.longitude !== null;
  return (
    <AdminField id={id} label={label}>
      <input id={id} className={adminFieldClass} value={value.label} placeholder="Place name" onChange={(event) => onLabel(event.target.value)} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="rounded-lg bg-[var(--admin-nav-active)] px-3 py-2 text-xs font-semibold" onClick={onCapture} disabled={capturing}>
          {capturing ? "Capturing..." : "Use this device"}
        </button>
        {pinned ? (
          <button type="button" className="text-xs font-semibold text-[var(--admin-muted)]" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-[var(--admin-muted)]">{pinned ? `Captured ${value.latitude?.toFixed(5)}, ${value.longitude?.toFixed(5)}. Save settings to keep it.` : "Stand at this place, capture it, then save settings."}</p>
    </AdminField>
  );
}
