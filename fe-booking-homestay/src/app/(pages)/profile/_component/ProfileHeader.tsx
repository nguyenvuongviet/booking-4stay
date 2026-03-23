import { useLang } from "@/context/lang-context";
import { IUser } from "@/models/User";

interface Props {
    user: IUser;
}

export default function ProfileHeader({ user }: Props) {
    const { t } = useLang();
    
    return (
        <div className="mb-8 rounded-2xl bg-secondary/60 p-4 px-8 shadow-lg">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-6">
                    <img
                        className="h-28 w-28 object-cover rounded-full"
                        src={user.avatar || "/default-avatar.png"}
                        alt="avatar"
                    />
                    <div>
                        <h1 className="text-2xl elegant-sans">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                        <p className="text-muted-foreground text-sm">{user.phoneNumber}</p>
                        <p className="text-muted text-sm">
                            {t("member_since")}{" "}
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-GB")
                                : "-"}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 grid-row-1">
                    <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center">
                            <p className="text-sm pb-2">{t("total_bookings")}</p>
                            <p className="text-lg elegant-sans">
                                {user?.loyalty_program.totalBooking || 0}
                            </p>
                        </div>

                        <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center">
                            <p className="text-sm pb-2">{t("loyalty_points")}</p>
                            <p className="text-lg elegant-sans">
                                {user?.loyalty_program.totalPoint || 0}
                            </p>
                        </div>

                        <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center">
                            <p className="text-sm pb-2 ">{t("loyalty_level")}</p>
                            <p className="text-lg elegant-sans">
                                {user?.loyalty_program.levels.name || "_"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}