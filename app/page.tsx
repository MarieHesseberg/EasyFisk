import { EasyFiskApp } from "@/components/layout/easy-fisk-app";
import { LanguageProvider } from "@/components/localization/language-provider";

export default function Page() {
  return (
    <LanguageProvider>
      <EasyFiskApp />
    </LanguageProvider>
  );
}
