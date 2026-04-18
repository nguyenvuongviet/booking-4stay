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
        <Card className="p-6">
            <h2 className="text-2xl elegant-heading mb-4">
                {t("Guest information")}
            </h2>
            <div className="grid grid-cols-2  gap-4">
                {/* First Name */}
                <div>
                    <Label
                        htmlFor="firstName"
                        className="text-foreground elegant-subheading"
                    >
                        {t("firstName")}
                    </Label>
                    <Input
                        id="firstName"
                        className="bg-input rounded-2xl mt-1 mb-2"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    {firstNameError && (
                        <p className="text-destructive text-xs mb-1">
                            {firstNameError}
                        </p>
                    )}
                </div>
                {/* Last Name */}
                <div>
                    <Label
                        htmlFor="lastName"
                        className="text-foreground elegant-subheading"
                    >
                        {t("lastName")}
                    </Label>
                    <Input
                        id="lastName"
                        className="bg-input rounded-2xl mt-1 mb-2"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    {lastNameError && (
                        <p className="text-destructive text-xs mb-1">
                            {lastNameError}
                        </p>
                    )}
                </div>
                {/* Email */}
                <div>
                    <Label
                        htmlFor="email"
                        className="text-foreground elegant-subheading"
                    >
                        Your email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        className="mt-1 bg-input rounded-2xl"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                    {emailError && (
                        <p className="text-destructive text-xs mb-2">{emailError}</p>
                    )}
                </div>
                {/* Phone Number  */}
                <div>
                    <Label
                        htmlFor="phone"
                        className="text-foreground elegant-subheading"
                    >
                        {t("phone")}
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        className="bg-input rounded-2xl mt-1 mb-2"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    {phoneError && (
                        <p className="text-destructive text-xs mb-2">{phoneError}</p>
                    )}
                </div>
            </div>
        </Card>
    );
}