"use client"

import { useState, useEffect } from "react"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { DataAuditTable } from "@/components/dashboard/data-audit-table"
import { getDataAuditEntries } from "@/lib/store"

export default function AuditPage() {
  const [auditEntries, setAuditEntries] = useState(getDataAuditEntries())

  useEffect(() => {
    setAuditEntries(getDataAuditEntries())
  }, [])

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="Data Audit" />
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <DataAuditTable entries={auditEntries} />
      </div>
    </div>
  )
}
