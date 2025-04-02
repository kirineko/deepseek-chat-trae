import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:p-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-4xl w-full flex flex-col items-center text-center gap-12">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            AI 智能助手
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl">
            体验下一代人工智能对话，获得即时、准确的答案
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">智能对话</h3>
              <p className="text-gray-600 dark:text-gray-400">与AI进行自然流畅的对话，就像与真人交谈一样</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">即时响应</h3>
              <p className="text-gray-600 dark:text-gray-400">快速获取答案，无需漫长等待</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">持续学习</h3>
              <p className="text-gray-600 dark:text-gray-400">AI不断进化，提供更精准的回答</p>
            </div>
          </div>

          <Link
            href="/chat"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            开始聊天
          </Link>
        </div>
      </main>
    </div>
  );
}
