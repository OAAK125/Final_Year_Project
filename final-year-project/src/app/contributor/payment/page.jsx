"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Wallet,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function PayoutPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [banks, setBanks] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Ensure user is logged in + fetch wallet
  useEffect(() => {
    async function fetchUserAndWallet() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/authentication/login");
        return;
      }
      setUser(user);

      // Fetch wallet by user_id (not contributor_id)
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (walletError) {
        console.error(walletError);
        toast.error("Failed to load wallet");
        return;
      }
      setWallet(walletData);
    }

    async function fetchBanks() {
      try {
        const res = await fetch("/api/paystack/banks");
        const data = await res.json();
        if (res.ok) {
          setBanks(data);
        } else {
          toast.error(data?.error || "Failed to load banks");
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not fetch banks");
      }
    }

    fetchUserAndWallet();
    fetchBanks();
  }, [supabase, router]);

  async function handleVerifyAccount() {
    if (!accountNumber || !bankCode) {
      toast.error("Enter account number and select a bank");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/paystack/resolve-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.details || data?.error || "Account resolution failed");
      }
      setAccountName(data.data.account_name);
      toast.success(`Account verified: ${data.data.account_name}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to resolve account");
      setAccountName("");
    } finally {
      setVerifying(false);
    }
  }

  async function handlePayout(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (!wallet) {
      setError("Wallet not found.");
      setLoading(false);
      return;
    }

    if (parseFloat(amount) > wallet.balance) {
      setError("Insufficient balance.");
      setLoading(false);
      return;
    }

    if (!accountName) {
      setError("Please verify the account before requesting payout.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/paystack/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_number: accountNumber,
          bank_code: bankCode,
          amount: parseFloat(amount),
          name: accountName, // verified name
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Deduct from wallet
        const { error: updateError } = await supabase
          .from("wallets")
          .update({ balance: wallet.balance - parseFloat(amount) })
          .eq("id", wallet.id);

        if (updateError) {
          console.error(updateError);
          toast.error("Payout succeeded but wallet update failed!");
        } else {
          setWallet((prev) => ({
            ...prev,
            balance: prev.balance - parseFloat(amount),
          }));
          setMessage("Transfer initiated successfully!");
          setAmount("");
          setAccountName("");
          setAccountNumber("");
          setBankCode("");
        }
      } else {
        setError(data?.error || "Transfer failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-2xl space-y-8">
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-primary to-sidebar-ring text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Your Wallet
            </CardTitle>
            <Banknote className="h-6 w-6 opacity-80" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              GHc {wallet ? Number(wallet.balance).toFixed(2) : "0.00"}
            </p>
            <p className="text-sm opacity-90 mt-1">Available Balance</p>
          </CardContent>
        </Card>

        {/* Payout Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Initiate Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handlePayout}>
              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>

              {/* Bank Selection */}
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select value={bankCode} onValueChange={setBankCode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((b) => (
                      <SelectItem key={b.code} value={b.code}>
                        {b.name} ({b.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account Name (auto-filled after verify) */}
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Account name"
                  value={accountName}
                  disabled
                  readOnly
                />
              </div>

              {/* Verify Button */}
              <Button
                type="button"
                onClick={handleVerifyAccount}
                disabled={verifying || !accountNumber || !bankCode}
                className="w-full"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Account"}
              </Button>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (GHc)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={loading || !accountName}>
                {loading ? (
                  <Loader2 className="w-5 animate-spin" />
                ) : (
                  "Send Payout"
                )}
              </Button>
            </form>

            {/* Feedback */}
            {message && (
              <div className="mt-6 flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {message}
              </div>
            )}
            {error && (
              <div className="mt-6 flex items-center gap-2 text-red-600 text-sm">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
