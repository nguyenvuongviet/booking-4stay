import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { useLang } from "@/context/lang-context";

interface Props {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  firstNameError: string;
  lastNameError: string;
  phoneError: string;
  emailError: string;
}

export default function GuestInfor(props: Props) {
  const { t } = useLang();
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    emailInput,
    setEmailInput,
    phone,
    setPhone,
    firstNameError,
    lastNameError,
    phoneError,
    emailError,
  } = props;

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl elegant-heading mb-2 sm:mb-4">
        {t("Guest information")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {/* First Name */}
        <div>
          <Label
            htmlFor="firstName"
            className="text-sm font-semibold text-foreground block"
          >
            {t("firstName")}
          </Label>
          <Input
            id="firstName"
            className="bg-input rounded-2xl border border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 mt-1.5 h-11 text-sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {firstNameError && (
            <p className="text-destructive text-xs mt-1">{firstNameError}</p>
          )}
        </div>
        {/* Last Name */}
        <div>
          <Label
            htmlFor="lastName"
            className="text-sm font-semibold text-foreground block"
          >
            {t("lastName")}
          </Label>
          <Input
            id="lastName"
            className="bg-input rounded-2xl border border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 mt-1.5 h-11 text-sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {lastNameError && (
            <p className="text-destructive text-xs mt-1">{lastNameError}</p>
          )}
        </div>
        {/* Email */}
        <div>
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-foreground block"
          >
            Your email
          </Label>
          <Input
            id="email"
            type="email"
            className="bg-input rounded-2xl border border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 mt-1.5 h-11 text-sm"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          {emailError && (
            <p className="text-destructive text-xs mt-1">{emailError}</p>
          )}
        </div>
        {/* Phone Number  */}
        <div>
          <Label
            htmlFor="phone"
            className="text-sm font-semibold text-foreground block"
          >
            {t("phone")}
          </Label>
          <Input
            id="phone"
            type="tel"
            className="bg-input rounded-2xl border border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 mt-1.5 h-11 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {phoneError && (
            <p className="text-destructive text-xs mt-1">{phoneError}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
