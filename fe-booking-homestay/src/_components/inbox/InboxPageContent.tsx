import ChatArea from "@/_components/inbox/ChatArea";
import ContextPanel from "@/_components/inbox/ContextPanel";
import ConversationList from "@/_components/inbox/ConversationList";
import EmptyChatState from "@/_components/inbox/EmptyChatState";
import { useInbox } from "@/_hooks/useInbox";
import { useAuth } from "@/context/auth-context";
import { useRealtimeChat } from "@/context/ChatContext";
import { AlertCircle, Home } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function InboxPageContent() {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    isTyping,
    typingUser,
    isLoadingConversations,
    isLoadingMessages,
    selectConversation,
    createOrGetConversation,
  } = useRealtimeChat();

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    inputText,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filteredConversations,
    mobileView,
    setMobileView,
    handleSend,
    handleInputChange,
    handleSelectTemplate,
  } = useInbox();

  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!user) return;
    const hostId = searchParams.get("hostId");
    const roomId = searchParams.get("roomId");
    if (hostId) {
      createOrGetConversation(+hostId, roomId ? +roomId : undefined).then(
        () => {
          router.replace("/inbox");
          setMobileView("chat");
        },
      );
    }
  }, [user, searchParams, createOrGetConversation, router, setMobileView]);

  // Khi chọn conversation trên mobile → chuyển sang view chat
  const handleSelectConversation = async (id: number) => {
    await selectConversation(id);
    setMobileView("chat");
    setShowInfo(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground font-sans">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-secondary shadow-sm mb-5">
          <AlertCircle className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Yêu cầu đăng nhập
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center leading-relaxed">
          Vui lòng đăng nhập tài khoản 4stay để truy cập hệ thống nhắn tin và
          đặt phòng.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <Home className="h-4 w-4" /> Quay về Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-foreground font-sans relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Base */}
        <div className="absolute inset-0 bg-background dark:bg-background" />

        {/* Soft gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-sky-100/20 via-transparent to-violet-100/20 dark:from-sky-500/10 dark:via-transparent dark:to-violet-500/10" />

        {/* Top glow */}
        <div className="absolute top-0 left-1/2 h-100 w-175 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl dark:bg-cyan-500/10" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>

      <div
        className={`
          relative z-10 h-full shrink-0
          w-full md:w-80 lg:w-88
          ${mobileView === "list" ? "flex" : "hidden"} md:flex flex-col
        `}
      >
        <ConversationList
          userId={user.id}
          conversations={conversations}
          filteredConversations={filteredConversations}
          activeConversationId={activeConversation?.id}
          isLoading={isLoadingConversations}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          onSelect={handleSelectConversation}
        />
      </div>

      <div
        className={`
          relative z-10 flex-1 flex h-full overflow-hidden
          ${mobileView === "chat" ? "flex" : "hidden"} md:flex
        `}
      >
        {/* Khung chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeConversation ? (
            <ChatArea
              userId={user.id}
              activeConversation={activeConversation}
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              isTyping={isTyping}
              typingUser={typingUser}
              inputText={inputText}
              onInputChange={handleInputChange}
              onSend={handleSend}
              onSelectTemplate={handleSelectTemplate}
              onBack={() => setMobileView("list")}
              onToggleInfo={
                activeConversation ? () => setShowInfo(true) : undefined
              }
            />
          ) : (
            <EmptyChatState filterType={filterType} />
          )}
        </div>

        {activeConversation && (
          <ContextPanel
            activeConversation={activeConversation}
            userId={user.id}
            open={showInfo}
            onClose={() => setShowInfo(false)}
          />
        )}
      </div>
    </div>
  );
}
