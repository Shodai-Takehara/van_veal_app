"use client"

import { useState, useEffect } from "react"

export function useMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 初期値を設定（サーバーサイドレンダリング対策）
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // リサイズイベントのハンドラ
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // リサイズイベントリスナーを追加
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
    }

    // クリーンアップ関数
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [breakpoint])

  return isMobile
}

