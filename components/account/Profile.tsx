"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import moment from "moment";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import DeleteAccountDialog from "../modals/DeleteAccountDialog";

import { OAuthProvider, ProfileDTO } from "@/types/globals";
import { openOAuthPopup } from "@/lib/oauth-popup";
import { fetcher } from "@/lib/helpers";

const providers: {
  name: string;
  provider: OAuthProvider;
  icon: React.ReactNode;
}[] = [
  {
    name: "Google",
    provider: "google",
    icon: (
      <img src="/icons/google-logo.svg" className="w-4 h-4" alt="Google Logo" />
    ),
  },
  {
    name: "LinkedIn",
    provider: "linkedin",
    icon: (
      <img
        src="/icons/linkedin-logo.svg"
        className="w-4 h-4"
        alt="Linkedin Logo"
      />
    ),
  },
  {
    name: "GitHub",
    provider: "github",
    icon: (
      <img src="/icons/github-logo.svg" className="w-4 h-4" alt="Github Logo" />
    ),
  },
];

const AccountProfile = () => {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<ProfileDTO>("/api/user", fetcher);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setJobTitle(user.jobTitle ?? "");
      setPhone(user.phone ?? "");
      setImage(user.image ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = {
        name,
        jobTitle,
        phone,
        image,
      };

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update profile");
      }

      await mutate();

      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectProvider = async (provider: OAuthProvider) => {
    setConnectingProvider(provider);

    openOAuthPopup(
      provider,
      "/auth/oauth-callback",
      () => {
        // Success callback
        setConnectingProvider(null);
        mutate(); // Refresh user data
        toast.success(
          `${
            provider.charAt(0).toUpperCase() + provider.slice(1)
          } connected successfully`
        );
      },
      (error) => {
        // Error callback
        setConnectingProvider(null);
        toast.error(error);
      }
    );
  };

  // Check if user has a password (signed up with email/password vs OAuth only)
  const hasPassword = user?.connectedProviders
    ? user.connectedProviders.length === 0 ||
      !user.connectedProviders.every((p) =>
        ["google", "github", "linkedin"].includes(p)
      )
    : true;

  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="max-w-xl mx-auto py-10 px-6 space-y-10">
          {isLoading || !user ? (
            <p className="text-primary text-center animate-pulse">
              Loading your profile...
            </p>
          ) : error ? (
            <p className="text-destructive">
              Failed to loading your profile. Please try Again Later
            </p>
          ) : (
            <>
              {/* Avatar + Basic Info */}
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20">
                  {image ? (
                    <AvatarImage src={image} alt={name} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {name?.[0] ?? "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">{name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Editable Personal Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
                <h3 className="font-medium text-lg">Personal Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={user?.email ?? ""}
                    disabled
                    className="cursor-not-allowed bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>

              {/* Account Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-medium text-lg mb-4">Account Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Member since:</span>{" "}
                    {user
                      ? moment(user.createdAt).local().format("D MMMM YYYY")
                      : "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Last login:</span>{" "}
                    {user?.lastLogin
                      ? moment(user.lastLogin)
                          .local()
                          .format("D MMMM YYYY hh:mm")
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-medium text-lg mb-4">Connected Accounts</h3>

                {providers.map(({ name, provider, icon }) => {
                  const isConnected =
                    user?.connectedProviders?.includes(provider);
                  const isConnecting = connectingProvider === provider;

                  return (
                    <div key={provider}>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          {icon}
                          <p>{name}</p>
                        </div>

                        {isConnected ? (
                          <Button variant="secondary" size="sm" disabled>
                            Connected
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnectProvider(provider)}
                            disabled={isConnecting || !!connectingProvider}
                          >
                            {isConnecting ? "Connecting..." : "Connect"}
                          </Button>
                        )}
                      </div>
                      <Separator />
                    </div>
                  );
                })}
              </div>

              {/* Security / Danger Zone */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-destructive/20 border">
                <h3 className="font-medium text-lg mb-2 text-destructive">
                  Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back.<br />
                  Please be certain.
                </p>
                <Button
                  variant="destructive"
                  className="w-fit"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        hasPassword={hasPassword}
      />
    </>
  );
};

export default AccountProfile;
