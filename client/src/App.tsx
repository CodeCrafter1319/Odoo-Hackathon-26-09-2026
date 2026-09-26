import { FormEvent, ReactNode, useMemo, useState, useEffect } from "react"
import { authService, dashboardService, productService, categoryService, warehouseService, locationService } from "./services"

type Page = "Dashboard" | "Receipts" | "Delivery" | "Internal Transfers" | "Inventory Adjustments" | "Products" | "Move History" | "Warehouse" | "Locations"

type IconName = "box" | "chevron" | "search" | "plus" | "list" | "columns" | "user" | "bell" | "truck" | "receipt" | "adjust" | "history" | "warehouse" | "pin" | "check" | "print" | "x" | "edit" | "menu" | "arrow" | "logout"

const icons: Record<IconName, ReactNode> = {
  box: (
    <>
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="m3 8 9 5v9m9-14-9 5" />
      <path d="M3 8v9l9 5 9-5V8" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3" cy="6" r="1" />
      <circle cx="3" cy="12" r="1" />
      <circle cx="3" cy="18" r="1" />
    </>
  ),
  columns: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <rect x="14" y="4" width="7" height="16" rx="1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 5h11v12H3z" />
      <path d="M14 9h4l3 4v4h-7z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  adjust: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="10" cy="18" r="2" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  warehouse: (
    <>
      <path d="m3 10 9-6 9 6v10H3z" />
      <path d="M7 14h10M7 17h10M7 20h10" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  print: (
    <>
      <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
  edit: (
    <>
      <path d="m4 20 4-1 11-11-3-3L5 16z" />
      <path d="m14 7 3 3" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3M14 3h7v18h-7" />
    </>
  ),
}

function Icon({
  name,
  className = "size-5",
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

function Button({
  children,
  icon,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
}: {
  children: ReactNode
  icon?: IconName
  variant?: "primary" | "secondary" | "ghost" | "danger"
  type?: "button" | "submit"
  onClick?: () => void
  className?: string
}) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-strong shadow-sm",
    secondary:
      "border border-line bg-white text-ink hover:border-brand/30 hover:bg-brand-soft/40",
    ghost: "text-muted hover:bg-surface hover:text-ink",
    danger:
      "border border-danger/20 bg-danger-soft text-danger hover:bg-danger/10",
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${styles[variant]} ${className}`}
    >
      {icon && <Icon name={icon} className="size-4" />}
      {children}
    </button>
  )
}

function IconButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: IconName
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-lg border transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-white text-muted hover:text-brand"
      }`}
    >
      <Icon name={icon} className="size-4" />
    </button>
  )
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label
      className={`grid gap-2 text-sm font-semibold text-body ${className}`}
    >
      <span>{label}</span>
      {children}
    </label>
  )
}

function Input({
  placeholder,
  type = "text",
  defaultValue,
  icon,
  value,
  onChange,
  name,
}: {
  placeholder?: string
  type?: string
  defaultValue?: string
  icon?: IconName
  value?: string
  onChange?: (value: string) => void
  name?: string
}) {
  return (
    <span className="relative block">
      {icon && (
        <Icon
          name={icon}
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
        />
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className={`h-11 w-full rounded-lg border border-line bg-white text-sm text-ink outline-none transition placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/10 ${
          icon ? "pl-9 pr-3" : "px-3"
        }`}
      />
    </span>
  )
}

function Select({
  children,
  defaultValue,
  value,
  onChange,
  name,
}: {
  children: ReactNode
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  name?: string
}) {
  return (
    <span className="relative block">
      <select
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
      >
        {children}
      </select>
      <Icon
        name="chevron"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-muted"
      />
    </span>
  )
}

function Badge({ children }: { children: string }) {
  const style: Record<string, string> = {
    Ready: "bg-info-soft text-info",
    Waiting: "bg-warning-soft text-warning",
    Draft: "bg-neutral-soft text-muted",
    Done: "bg-success-soft text-success",
    Scheduled: "bg-info-soft text-info",
    "In Transit": "bg-warning-soft text-warning",
    Pending: "bg-warning-soft text-warning",
    Approved: "bg-info-soft text-info",
    Received: "bg-success-soft text-success",
    Canceled: "bg-danger-soft text-danger",
    "Out of Stock": "bg-danger-soft text-danger",
    "Low Stock": "bg-warning-soft text-warning",
    "In Stock": "bg-success-soft text-success",
  }
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        style[children] || "bg-brand-soft text-brand"
      }`}
    >
      {children}
    </span>
  )
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-white shadow-card ${className}`}
    >
      {children}
    </section>
  )
}

const topNav: { label: string page?: Page menu?: Page[] }[] = [
  { label: "Dashboard", page: "Dashboard" },
  {
    label: "Operations",
    menu: [
      "Receipts",
      "Delivery",
      "Internal Transfers",
      "Inventory Adjustments",
    ],
  },
  { label: "Products", page: "Products" },
  { label: "Move History", page: "Move History" },
  { label: "Settings", menu: ["Warehouse", "Locations"] },
]

function AppHeader({
  page,
  setPage,
  onLogout,
}: {
  page: Page
  setPage: (page: Page) => void
  onLogout: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [profile, setProfile] = useState(false)
  const activeFor = (item: typeof topNav[number]) =>
    item.page === page || item.menu?.includes(page)

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-screen-2xl items-center px-4 md:px-7">
        <button
          type="button"
          onClick={() => setPage("Dashboard")}
          className="mr-8 flex items-center gap-3"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-brand text-white">
            <Icon name="box" className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            StockSense
          </span>
        </button>

        <nav className="hidden h-full items-center gap-1 lg:flex">
          {topNav.map((item) => (
            <div key={item.label} className="relative h-full">
              <button
                type="button"
                onClick={() => {
                  if (item.page) setPage(item.page)
                  else setOpenMenu(openMenu === item.label ? null : item.label)
                }}
                className={`flex h-full items-center gap-1.5 border-b-2 px-4 text-sm font-semibold transition ${
                  activeFor(item)
                    ? "border-brand text-brand"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {item.label}
                {item.menu && (
                  <Icon name="chevron" className="size-3.5 rotate-90" />
                )}
              </button>
              {item.menu && openMenu === item.label && (
                <Card className="absolute left-0 top-15 min-w-52 p-2 shadow-pop">
                  {item.menu.map((menuItem) => (
                    <button
                      type="button"
                      key={menuItem}
                      onClick={() => {
                        setPage(menuItem)
                        setOpenMenu(null)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-body hover:bg-surface hover:text-brand"
                    >
                      <Icon
                        name={
                          menuItem === "Receipts"
                            ? "receipt"
                            : menuItem === "Delivery"
                              ? "truck"
                              : menuItem === "Internal Transfers"
                                ? "history"
                                : menuItem === "Warehouse"
                                  ? "warehouse"
                                  : menuItem === "Locations"
                                    ? "pin"
                                    : "adjust"
                        }
                        className="size-4"
                      />
                      {menuItem}
                    </button>
                  ))}
                </Card>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success md:inline-flex">
            Central Warehouse
          </span>
          <IconButton icon="bell" label="Notifications" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfile(!profile)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface"
            >
              <span className="grid size-9 place-items-center rounded-full bg-sidebar text-xs font-bold text-white">
                AM
              </span>
              <span className="hidden text-left md:block">
                <span className="block text-sm font-bold text-ink">
                  Avery Morgan
                </span>
                <span className="block text-xs text-muted">
                  Inventory Manager
                </span>
              </span>
              <Icon
                name="chevron"
                className="hidden size-3.5 rotate-90 text-muted md:block"
              />
            </button>
            {profile && (
              <Card className="absolute right-0 top-13 w-48 p-2 shadow-pop">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-body hover:bg-surface"
                >
                  <Icon name="user" className="size-4" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger-soft"
                >
                  <Icon name="logout" className="size-4" />
                  Logout
                </button>
              </Card>
            )}
          </div>
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid size-9 place-items-center rounded-lg border border-line text-muted lg:hidden"
          >
            <Icon name={mobileOpen ? "x" : "menu"} className="size-5" />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="border-t border-line bg-white p-3 lg:hidden">
          {topNav
            .flatMap((item) =>
              item.menu
                ? item.menu.map((menuItem) => ({
                    label: menuItem,
                    page: menuItem,
                  }))
                : [{ label: item.label, page: item.page! }],
            )
            .map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => {
                  setPage(item.page)
                  setMobileOpen(false)
                }}
                className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${
                  page === item.page ? "bg-brand-soft text-brand" : "text-body"
                }`}
              >
                {item.label}
              </button>
            ))}
        </nav>
      )}
    </header>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

function DashboardCard({
  type,
  primary,
  late,
  waiting,
  operations,
  onOpen,
}: {
  type: "Receipt" | "Delivery"
  primary: string
  late: number
  waiting?: number
  operations: number
  onOpen: () => void
}) {
  const receipt = type === "Receipt"
  return (
    <Card className="group overflow-hidden">
      <div className={`h-1.5 ${receipt ? "bg-success" : "bg-brand"}`} />
      <div className="p-6 md:p-8">
        <div className="mb-8 flex items-start justify-between">
          <span
            className={`grid size-12 place-items-center rounded-xl ${
              receipt
                ? "bg-success-soft text-success"
                : "bg-brand-soft text-brand"
            }`}
          >
            <Icon name={receipt ? "receipt" : "truck"} className="size-6" />
          </span>
          <span className="text-xs font-semibold text-subtle">
            Today, 24 May
          </span>
        </div>
        <h2 className="text-xl font-bold text-ink">{type}</h2>
        <p className="mt-1 text-sm text-muted">
          {receipt
            ? "Incoming stock from vendors"
            : "Outgoing stock to customers"}
        </p>
        <div className="mt-7 grid grid-cols-[1fr_auto] items-end gap-6">
          <button
            type="button"
            onClick={onOpen}
            className={`flex items-center justify-between rounded-xl border p-4 text-left transition group-hover:shadow-card ${
              receipt
                ? "border-success/20 bg-success-soft text-success"
                : "border-brand/20 bg-brand-soft text-brand"
            }`}
          >
            <span>
              <span className="block text-2xl font-bold">{primary}</span>
              <span className="mt-0.5 block text-xs font-semibold">
                {receipt ? "to receive" : "to deliver"}
              </span>
            </span>
            <Icon name="arrow" />
          </button>
          <div className="min-w-28 space-y-2 text-sm">
            <p className="flex items-center justify-between gap-5">
              <span className="text-muted">Late</span>
              <span className="font-bold text-danger">{late}</span>
            </p>
            {waiting !== undefined && (
              <p className="flex items-center justify-between gap-5">
                <span className="text-muted">Waiting</span>
                <span className="font-bold text-warning">{waiting}</span>
              </p>
            )}
            <p className="flex items-center justify-between gap-5">
              <span className="text-muted">Operations</span>
              <span className="font-bold text-ink">{operations}</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function Dashboard({ setPage }: { setPage: (page: Page) => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await dashboardService.getSummary()
        if (mounted) setData(response.data || response)
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load dashboard")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchDashboard()
    return () => { mounted = false; }
  }, [])

  if (loading) return <div className="p-12 text-center text-muted">Loading dashboard...</div>
  if (error) return <div className="p-12 text-center text-danger">{error}</div>

  return (
    <div className="grid gap-7">
      <PageHeading
        eyebrow="Operations overview"
        title="Dashboard"
        description="Monitor the work that needs attention today."
        action={
          <div className="flex items-center gap-2 rounded-lg border border-line bg-white p-1">
            <button
              type="button"
              className="rounded-md bg-surface px-3 py-1.5 text-xs font-bold text-ink"
            >
              Today
            </button>
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-semibold text-muted"
            >
              This week
            </button>
          </div>
        }
      />
      
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold text-muted uppercase">Total Products in Stock</p>
          <p className="mt-2 text-2xl font-bold text-ink">{data?.totalProductsInStock || 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-muted uppercase">Low Stock</p>
          <p className="mt-2 text-2xl font-bold text-warning">{data?.lowStockProducts || 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-muted uppercase">Out of Stock</p>
          <p className="mt-2 text-2xl font-bold text-danger">{data?.outOfStockProducts || 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-muted uppercase">Scheduled Transfers</p>
          <p className="mt-2 text-2xl font-bold text-brand">{data?.scheduledTransfers || 0}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          type="Receipt"
          primary={String(data?.pendingReceipts || 0)}
          late={0}
          operations={data?.pendingReceipts || 0}
          onOpen={() => setPage("Receipts")}
        />
        <DashboardCard
          type="Delivery"
          primary={String(data?.pendingDeliveries || 0)}
          late={0}
          waiting={0}
          operations={data?.pendingDeliveries || 0}
          onOpen={() => setPage("Delivery")}
        />
      </div>
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-ink">Operation definitions</h2>
            <p className="mt-1 text-sm text-muted">
              Counts are calculated from each operation's scheduled date and
              stock availability.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-danger-soft px-3 py-1.5 text-danger">
              Late: scheduled before today
            </span>
            <span className="rounded-full bg-info-soft px-3 py-1.5 text-info">
              Scheduled: after today
            </span>
            <span className="rounded-full bg-warning-soft px-3 py-1.5 text-warning">
              Waiting: awaiting stock
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

const receiptRows = [
  [
    "WH/IN/0001",
    "Vendor",
    "WH/Stock 1",
    "Azure Interior",
    "24 May 2025",
    "Ready",
  ],
  [
    "WH/IN/0002",
    "Vendor",
    "WH/Stock 1",
    "Brightline Supply",
    "25 May 2025",
    "Ready",
  ],
  [
    "WH/IN/0003",
    "Vendor",
    "WH/Stock 2",
    "Nova Components",
    "27 May 2025",
    "Waiting",
  ],
]

const deliveryRows = [
  [
    "WH/OUT/0001",
    "WH/Stock 1",
    "Customer",
    "Azure Interior",
    "24 May 2025",
    "Ready",
  ],
  [
    "WH/OUT/0002",
    "WH/Stock 1",
    "Customer",
    "Mason Retail",
    "25 May 2025",
    "Ready",
  ],
  [
    "WH/OUT/0003",
    "WH/Stock 2",
    "Customer",
    "North & Pine",
    "27 May 2025",
    "Waiting",
  ],
]

function DataTable({
  columns,
  rows,
  onOpen,
}: {
  columns: string[]
  rows: (string | ReactNode)[][]
  onOpen?: (row: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface">
            {columns.map((column) => (
              <th
                key={column}
                className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onOpen?.(rowIndex)}
              className={`border-b border-line/80 last:border-0 hover:bg-surface/70 ${
                onOpen ? "cursor-pointer" : ""
              }`}
            >
              {row.map((cell, index) => (
                <td
                  key={index}
                  className="whitespace-nowrap px-5 py-4 text-sm text-body"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListToolbar({
  search,
  view,
  setView,
}: {
  search: string
  view: "list" | "kanban"
  setView: (view: "list" | "kanban") => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
      <div className="w-full md:max-w-sm">
        <Input placeholder={search} icon="search" />
      </div>
      <div className="flex items-center gap-2 md:ml-auto">
        <Select>
          <option>All statuses</option>
          <option>Draft</option>
          <option>Waiting</option>
          <option>Ready</option>
          <option>Done</option>
        </Select>
        <IconButton
          icon="list"
          label="List view"
          active={view === "list"}
          onClick={() => setView("list")}
        />
        <IconButton
          icon="columns"
          label="Kanban view"
          active={view === "kanban"}
          onClick={() => setView("kanban")}
        />
      </div>
    </div>
  )
}

function Kanban({ rows }: { rows: string[][] }) {
  return (
    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
      {["Draft", "Waiting", "Ready", "Done"].map((status) => (
        <div key={status}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              {status}
            </span>
            <span className="rounded-full bg-neutral-soft px-2 py-0.5 text-xs text-muted">
              {status === "Ready" ? 2 : 1}
            </span>
          </div>
          {status === "Ready" && rows.slice(0, 2).map((row) => (
              <Card key={row[0]} className="mb-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{row[0]}</p>
                    <p className="mt-1 text-xs text-muted">{row[3]}</p>
                  </div>
                  <Badge>{status}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-subtle">
                  <span>{row[1]}</span>
                  <span>{row[4]}</span>
                </div>
              </Card>
            ))}
        </div>
      ))}
    </div>
  )
}

function StatusStepper({ delivery }: { delivery: boolean }) {
  const steps = delivery
    ? ["Draft", "Waiting", "Ready", "Done"]
    : ["Draft", "Ready", "Done"]
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              index === 0 ? "bg-brand text-white" : "bg-neutral-soft text-muted"
            }`}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <Icon name="chevron" className="size-3 text-subtle" />
          )}
        </div>
      ))}
    </div>
  )
}

function OperationForm({
  delivery,
  close,
  showToast,
}: {
  delivery: boolean
  close: () => void
  showToast: (message: string) => void
}) {
  const title = delivery ? "Delivery" : "Receipt"
  return (
    <div className="grid gap-6">
      <PageHeading
        eyebrow={`Operations / ${title}`}
        title={title}
        description={
          delivery
            ? "Create and validate an outgoing stock operation."
            : "Create and validate an incoming stock operation."
        }
      />
      <Card>
        <div className="flex flex-col gap-4 border-b border-line p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              icon="check"
              onClick={() =>
                showToast(
                  `${title} validated — stock ${
                    delivery ? "decreased" : "increased"
                  }.`,
                )
              }
            >
              Validate
            </Button>
            <Button variant="secondary" icon="print">
              Print
            </Button>
            <Button variant="danger" icon="x" onClick={close}>
              Cancel
            </Button>
          </div>
          <StatusStepper delivery={delivery} />
        </div>
        <div className="border-b border-line bg-surface/60 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Reference
          </p>
          <p className="mt-1 text-xl font-bold text-ink">
            {delivery ? "WH/OUT/0004" : "WH/IN/0004"}
          </p>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label={delivery ? "Delivery Address" : "Receive From"}>
            <Input
              placeholder={
                delivery ? "Select customer address" : "Select vendor"
              }
            />
          </Field>
          <Field label="Schedule Date">
            <Input type="date" />
          </Field>
          <Field label="Responsible">
            <Select>
              <option>Avery Morgan</option>
              <option>Jordan Chen</option>
            </Select>
          </Field>
          {delivery ? (
            <Field label="Operation Type">
              <Select>
                <option>Customer Delivery</option>
                <option>Internal Dispatch</option>
              </Select>
            </Field>
          ) : (
            <Field label="Destination Location">
              <Select>
                <option>WH / Stock 1</option>
                <option>WH / Stock 2</option>
              </Select>
            </Field>
          )}
        </div>
        <div className="border-t border-line">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="font-bold text-ink">Products</h2>
              <p className="mt-0.5 text-xs text-muted">
                Products included in this operation
              </p>
            </div>
            <Button variant="secondary" icon="plus">
              Add product
            </Button>
          </div>
          <DataTable
            columns={["Product", "Available", "Quantity"]}
            rows={[
              [
                <span className="font-semibold text-ink">[DESK001] Desk</span>,
                "45 units",
                <div className="w-28">
                  <Input type="number" defaultValue="6" />
                </div>,
              ],
            ]}
          />
          {delivery && (
            <div className="m-5 flex items-center gap-3 rounded-lg border border-warning/20 bg-warning-soft p-4 text-sm text-warning">
              <Icon name="bell" className="size-5 shrink-0" />
              The system will warn you and highlight a product if the requested
              quantity is unavailable.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function OperationsList({
  delivery,
  showToast,
}: {
  delivery: boolean
  showToast: (message: string) => void
}) {
  const [view, setView] = useState<"list" | "kanban">("list")
  const [form, setForm] = useState(false)
  const rows = delivery ? deliveryRows : receiptRows
  const title = delivery ? "Delivery" : "Receipts"

  if (form)
    return (
      <OperationForm
        delivery={delivery}
        close={() => setForm(false)}
        showToast={showToast}
      />
    )

  return (
    <div className="grid gap-6">
      <PageHeading
        eyebrow="Operations"
        title={title}
        description={
          delivery
            ? "All outgoing stock operations, shown in list view by default."
            : "All incoming stock operations, shown in list view by default."
        }
        action={
          <Button icon="plus" onClick={() => setForm(true)}>
            New
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <ListToolbar
          search={`Search ${
            delivery ? "delivery" : "receipt"
          } by reference or contact…`}
          view={view}
          setView={setView}
        />
        {view === "list" ? (
          <DataTable
            columns={[
              "Reference",
              "From",
              "To",
              "Contact",
              "Schedule Date",
              "Status",
            ]}
            rows={rows.map((row) => [
              <span className="font-bold text-brand">{row[0]}</span>,
              ...row.slice(1, 5),
              <Badge>{row[5]}</Badge>,
            ])}
            onOpen={() => setForm(true)}
          />
        ) : (
          <Kanban rows={rows} />
        )}
        <div className="flex items-center justify-between border-t border-line px-5 py-4 text-xs text-muted">
          <span>3 operations</span>
          <span>Updated a few seconds ago</span>
        </div>
      </Card>
    </div>
  )
}

type TransferRecord = {
  reference: string
  from: string
  to: string
  product: string
  quantity: string
  scheduledDate: string
  status: string
}

const initialTransfers: TransferRecord[] = [
  {
    reference: "INT/2025/0001",
    from: "Central / WH / Stock 1",
    to: "East / WH / Stock 3",
    product: "Desk",
    quantity: "20",
    scheduledDate: "24 May 2025",
    status: "Scheduled",
  },
  {
    reference: "INT/2025/0002",
    from: "Central / WH / Stock 2",
    to: "Production / Stock 1",
    product: "Table",
    quantity: "10",
    scheduledDate: "25 May 2025",
    status: "In Transit",
  },
  {
    reference: "INT/2025/0003",
    from: "Production / Stock 1",
    to: "Central / WH / Stock 1",
    product: "Office Chair",
    quantity: "5",
    scheduledDate: "23 May 2025",
    status: "Done",
  },
]

type TransferFormState = {
  sourceWarehouse: string
  sourceLocation: string
  destinationWarehouse: string
  destinationLocation: string
  product: string
  quantity: string
  scheduledDate: string
  notes: string
}

const emptyTransfer: TransferFormState = {
  sourceWarehouse: "",
  sourceLocation: "",
  destinationWarehouse: "",
  destinationLocation: "",
  product: "",
  quantity: "",
  scheduledDate: "",
  notes: "",
}

function InternalTransfers({
  showToast,
}: {
  showToast: (message: string) => void
}) {
  const [records, setRecords] = useState(initialTransfers)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyTransfer)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All statuses")
  const [source, setSource] = useState("All source warehouses")
  const [destination, setDestination] = useState("All destination warehouses")

  const update = (field: keyof TransferFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: "" }))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.sourceWarehouse)
      nextErrors.sourceWarehouse = "Source warehouse is required."
    if (!form.sourceLocation)
      nextErrors.sourceLocation = "Source location is required."
    if (!form.destinationWarehouse)
      nextErrors.destinationWarehouse = "Destination warehouse is required."
    if (!form.destinationLocation)
      nextErrors.destinationLocation = "Destination location is required."
    if (!form.product) nextErrors.product = "Product is required."
    if (!form.quantity || Number(form.quantity) <= 0)
      nextErrors.quantity = "Quantity must be greater than 0."
    if (!form.scheduledDate)
      nextErrors.scheduledDate = "Scheduled date is required."
    if (
      form.sourceWarehouse &&
      form.sourceLocation &&
      form.sourceWarehouse === form.destinationWarehouse &&
      form.sourceLocation === form.destinationLocation
    ) {
      nextErrors.destinationLocation =
        "Source and destination cannot be identical."
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const date = new Date(`${form.scheduledDate}T00:00:00`)
    setRecords((current) => [
      {
        reference: `INT/2025/${String(current.length + 1).padStart(4, "0")}`,
        from: `${form.sourceWarehouse} / ${form.sourceLocation}`,
        to: `${form.destinationWarehouse} / ${form.destinationLocation}`,
        product: form.product,
        quantity: form.quantity,
        scheduledDate: date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Draft",
      },
      ...current,
    ])
    setForm(emptyTransfer)
    setErrors({})
    setFormOpen(false)
    showToast("Internal transfer created successfully.")
  }

  const filteredRecords = records.filter((record) => {
    const term = search.toLowerCase()
    const matchesSearch =
      record.reference.toLowerCase().includes(term) ||
      record.product.toLowerCase().includes(term)
    const matchesStatus = status === "All statuses" || record.status === status
    const matchesSource =
      source === "All source warehouses" || record.from.startsWith(source)
    const matchesDestination =
      destination === "All destination warehouses" ||
      record.to.startsWith(destination)
    return matchesSearch && matchesStatus && matchesSource && matchesDestination
  })

  return (
    <div className="grid gap-6">
      <PageHeading
        eyebrow="Operations"
        title="Internal Transfers"
        description="Move stock between warehouses and locations."
        action={
          <Button icon="plus" onClick={() => setFormOpen(true)}>
            New Transfer
          </Button>
        }
      />
      {formOpen && (
        <Card>
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="font-bold text-ink">New Internal Transfer</h2>
              <p className="mt-1 text-xs text-muted">
                Define the source, destination, and stock to move.
              </p>
            </div>
            <IconButton
              icon="x"
              label="Close form"
              onClick={() => {
                setFormOpen(false)
                setForm(emptyTransfer)
                setErrors({})
              }}
            />
          </div>
          <form onSubmit={submit} className="grid gap-5 p-6 md:grid-cols-2">
            <Field label="Source Warehouse">
              <Select
                value={form.sourceWarehouse}
                onChange={(value) => update("sourceWarehouse", value)}
              >
                <option value="">Select source warehouse</option>
                <option>Central</option>
                <option>East</option>
                <option>Production</option>
              </Select>
              {errors.sourceWarehouse && (
                <span className="text-xs font-medium text-danger">
                  {errors.sourceWarehouse}
                </span>
              )}
            </Field>
            <Field label="Source Location">
              <Select
                value={form.sourceLocation}
                onChange={(value) => update("sourceLocation", value)}
              >
                <option value="">Select source location</option>
                <option>WH / Stock 1</option>
                <option>WH / Stock 2</option>
                <option>Stock 1</option>
              </Select>
              {errors.sourceLocation && (
                <span className="text-xs font-medium text-danger">
                  {errors.sourceLocation}
                </span>
              )}
            </Field>
            <Field label="Destination Warehouse">
              <Select
                value={form.destinationWarehouse}
                onChange={(value) => update("destinationWarehouse", value)}
              >
                <option value="">Select destination warehouse</option>
                <option>Central</option>
                <option>East</option>
                <option>Production</option>
              </Select>
              {errors.destinationWarehouse && (
                <span className="text-xs font-medium text-danger">
                  {errors.destinationWarehouse}
                </span>
              )}
            </Field>
            <Field label="Destination Location">
              <Select
                value={form.destinationLocation}
                onChange={(value) => update("destinationLocation", value)}
              >
                <option value="">Select destination location</option>
                <option>WH / Stock 1</option>
                <option>WH / Stock 3</option>
                <option>Stock 1</option>
              </Select>
              {errors.destinationLocation && (
                <span className="text-xs font-medium text-danger">
                  {errors.destinationLocation}
                </span>
              )}
            </Field>
            <Field label="Product">
              <Select
                value={form.product}
                onChange={(value) => update("product", value)}
              >
                <option value="">Select product</option>
                <option>Desk</option>
                <option>Table</option>
                <option>Office Chair</option>
                <option>Storage Shelf</option>
              </Select>
              {errors.product && (
                <span className="text-xs font-medium text-danger">
                  {errors.product}
                </span>
              )}
            </Field>
            <Field label="Quantity">
              <Input
                type="number"
                value={form.quantity}
                onChange={(value) => update("quantity", value)}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <span className="text-xs font-medium text-danger">
                  {errors.quantity}
                </span>
              )}
            </Field>
            <Field label="Scheduled Date">
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={(value) => update("scheduledDate", value)}
              />
              {errors.scheduledDate && (
                <span className="text-xs font-medium text-danger">
                  {errors.scheduledDate}
                </span>
              )}
            </Field>
            <Field label="Notes (optional)">
              <textarea
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Add handling or scheduling notes"
                className="min-h-24 w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
            </Field>
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setFormOpen(false)
                  setForm(emptyTransfer)
                  setErrors({})
                }}
              >
                Cancel
              </Button>
              <Button type="submit" icon="check">
                Create Transfer
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-2 xl:grid-cols-[1fr_13rem_15rem_15rem]">
          <Input
            placeholder="Search transfer reference or product..."
            icon="search"
            value={search}
            onChange={setSearch}
          />
          <Select value={status} onChange={setStatus}>
            <option>All statuses</option>
            <option>Draft</option>
            <option>Scheduled</option>
            <option>In Transit</option>
            <option>Done</option>
            <option>Canceled</option>
          </Select>
          <Select value={source} onChange={setSource}>
            <option>All source warehouses</option>
            <option>Central</option>
            <option>East</option>
            <option>Production</option>
          </Select>
          <Select value={destination} onChange={setDestination}>
            <option>All destination warehouses</option>
            <option>Central</option>
            <option>East</option>
            <option>Production</option>
          </Select>
        </div>
        <DataTable
          columns={[
            "Reference",
            "From",
            "To",
            "Product",
            "Quantity",
            "Scheduled Date",
            "Status",
            "Actions",
          ]}
          rows={filteredRecords.map((record) => [
            <span className="font-bold text-brand">{record.reference}</span>,
            record.from,
            record.to,
            record.product,
            record.quantity,
            record.scheduledDate,
            <Badge>{record.status}</Badge>,
            <IconButton icon="edit" label={`Edit ${record.reference}`} />,
          ])}
        />
        {!filteredRecords.length && (
          <div className="border-t border-line p-10 text-center text-sm text-muted">
            No transfers match the current filters.
          </div>
        )}
      </Card>
    </div>
  )
}

type AdjustmentRecord = {
  reference: string
  warehouse: string
  location: string
  product: string
  systemQuantity: number
  countedQuantity: number
  reason: string
  status: string
}

const initialAdjustments: AdjustmentRecord[] = [
  {
    reference: "ADJ/2025/0034",
    warehouse: "Central Warehouse",
    location: "WH / Stock 1",
    product: "Desk",
    systemQuantity: 50,
    countedQuantity: 52,
    reason: "Physical inventory count",
    status: "Pending",
  },
  {
    reference: "ADJ/2025/0033",
    warehouse: "Central Warehouse",
    location: "WH / Stock 2",
    product: "Table",
    systemQuantity: 50,
    countedQuantity: 47,
    reason: "Damaged stock",
    status: "Approved",
  },
  {
    reference: "ADJ/2025/0032",
    warehouse: "East Warehouse",
    location: "WH / Stock 3",
    product: "Office Chair",
    systemQuantity: 24,
    countedQuantity: 24,
    reason: "Cycle count",
    status: "Done",
  },
]

function DifferenceValue({ value }: { value: number }) {
  return (
    <span
      className={`font-bold ${
        value > 0 ? "text-success" : value < 0 ? "text-danger" : "text-muted"
      }`}
    >
      {value > 0 ? "+" : ""}
      {value}
    </span>
  )
}

function InventoryAdjustments({
  showToast,
}: {
  showToast: (message: string) => void
}) {
  const [records, setRecords] = useState(initialAdjustments)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All statuses")
  const [warehouse, setWarehouse] = useState("All warehouses")
  const [location, setLocation] = useState("All locations")
  const [form, setForm] = useState({
    warehouse: "",
    location: "",
    product: "",
    systemQuantity: "0",
    countedQuantity: "",
    reason: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const difference =
    Number(form.countedQuantity || 0) - Number(form.systemQuantity || 0)

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: "" }))
  }

  const selectProduct = (product: string) => {
    const quantities: Record<string, string> = {
      Desk: "50",
      Table: "50",
      "Office Chair": "24",
      "Storage Shelf": "14",
    }
    setForm((current) => ({
      ...current,
      product,
      systemQuantity: quantities[product] || "0",
    }))
    setErrors((current) => ({ ...current, product: "" }))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.warehouse) nextErrors.warehouse = "Warehouse is required."
    if (!form.location) nextErrors.location = "Location is required."
    if (!form.product) nextErrors.product = "Product is required."
    if (form.countedQuantity === "" || Number(form.countedQuantity) < 0)
      nextErrors.countedQuantity = "Enter a valid counted quantity."
    if (!form.reason.trim()) nextErrors.reason = "Reason is required."
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setRecords((current) => [
      {
        reference: `ADJ/2025/${String(current.length + 32).padStart(4, "0")}`,
        warehouse: form.warehouse,
        location: form.location,
        product: form.product,
        systemQuantity: Number(form.systemQuantity),
        countedQuantity: Number(form.countedQuantity),
        reason: form.reason.trim(),
        status: "Draft",
      },
      ...current,
    ])
    setForm({
      warehouse: "",
      location: "",
      product: "",
      systemQuantity: "0",
      countedQuantity: "",
      reason: "",
    })
    setErrors({})
    setFormOpen(false)
    showToast("Inventory adjustment created successfully.")
  }

  const filteredRecords = records.filter((record) => {
    const term = search.toLowerCase()
    return (
      (record.reference.toLowerCase().includes(term) ||
        record.product.toLowerCase().includes(term)) &&
      (status === "All statuses" || record.status === status) &&
      (warehouse === "All warehouses" || record.warehouse === warehouse) &&
      (location === "All locations" || record.location === location)
    )
  })

  return (
    <div className="grid gap-6">
      <PageHeading
        eyebrow="Operations"
        title="Inventory Adjustments"
        description="Reconcile physical counts with system quantities."
        action={
          <Button icon="plus" onClick={() => setFormOpen(true)}>
            New Adjustment
          </Button>
        }
      />
      {formOpen && (
        <Card>
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="font-bold text-ink">New Inventory Adjustment</h2>
              <p className="mt-1 text-xs text-muted">
                Compare the physical count with the current stock balance.
              </p>
            </div>
            <IconButton
              icon="x"
              label="Close form"
              onClick={() => {
                setFormOpen(false)
                setErrors({})
              }}
            />
          </div>
          <form onSubmit={submit} className="grid gap-5 p-6 md:grid-cols-2">
            <Field label="Warehouse">
              <Select
                value={form.warehouse}
                onChange={(value) => update("warehouse", value)}
              >
                <option value="">Select warehouse</option>
                <option>Central Warehouse</option>
                <option>East Warehouse</option>
              </Select>
              {errors.warehouse && (
                <span className="text-xs font-medium text-danger">
                  {errors.warehouse}
                </span>
              )}
            </Field>
            <Field label="Location">
              <Select
                value={form.location}
                onChange={(value) => update("location", value)}
              >
                <option value="">Select location</option>
                <option>WH / Stock 1</option>
                <option>WH / Stock 2</option>
                <option>WH / Stock 3</option>
              </Select>
              {errors.location && (
                <span className="text-xs font-medium text-danger">
                  {errors.location}
                </span>
              )}
            </Field>
            <Field label="Product">
              <Select value={form.product} onChange={selectProduct}>
                <option value="">Select product</option>
                <option>Desk</option>
                <option>Table</option>
                <option>Office Chair</option>
                <option>Storage Shelf</option>
              </Select>
              {errors.product && (
                <span className="text-xs font-medium text-danger">
                  {errors.product}
                </span>
              )}
            </Field>
            <Field label="System Quantity">
              <input
                readOnly
                value={form.systemQuantity}
                className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-muted outline-none"
              />
              <span className="text-xs font-normal text-subtle">
                Read from StockBalance when the backend is connected.
              </span>
            </Field>
            <Field label="Counted Quantity">
              <Input
                type="number"
                value={form.countedQuantity}
                onChange={(value) => update("countedQuantity", value)}
                placeholder="Enter physical count"
              />
              {errors.countedQuantity && (
                <span className="text-xs font-medium text-danger">
                  {errors.countedQuantity}
                </span>
              )}
            </Field>
            <Field label="Difference">
              <span
                className={`flex h-11 items-center rounded-lg border px-3 ${
                  difference > 0
                    ? "border-success/20 bg-success-soft"
                    : difference < 0
                      ? "border-danger/20 bg-danger-soft"
                      : "border-line bg-surface"
                }`}
              >
                <DifferenceValue value={difference} />
              </span>
            </Field>
            <Field label="Reason" className="md:col-span-2">
              <Input
                value={form.reason}
                onChange={(value) => update("reason", value)}
                placeholder="Explain the reason for this adjustment"
              />
              {errors.reason && (
                <span className="text-xs font-medium text-danger">
                  {errors.reason}
                </span>
              )}
            </Field>
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setFormOpen(false)
                  setErrors({})
                }}
              >
                Cancel
              </Button>
              <Button type="submit" icon="check">
                Create Adjustment
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-2 xl:grid-cols-[1fr_13rem_15rem_15rem]">
          <Input
            placeholder="Search adjustments..."
            icon="search"
            value={search}
            onChange={setSearch}
          />
          <Select value={status} onChange={setStatus}>
            <option>All statuses</option>
            <option>Draft</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Done</option>
            <option>Canceled</option>
          </Select>
          <Select value={warehouse} onChange={setWarehouse}>
            <option>All warehouses</option>
            <option>Central Warehouse</option>
            <option>East Warehouse</option>
          </Select>
          <Select value={location} onChange={setLocation}>
            <option>All locations</option>
            <option>WH / Stock 1</option>
            <option>WH / Stock 2</option>
            <option>WH / Stock 3</option>
          </Select>
        </div>
        <DataTable
          columns={[
            "Reference",
            "Location",
            "Product",
            "System Quantity",
            "Counted Quantity",
            "Difference",
            "Reason",
            "Status",
            "Actions",
          ]}
          rows={filteredRecords.map((record) => [
            <span className="font-bold text-brand">{record.reference}</span>,
            record.location,
            record.product,
            record.systemQuantity,
            record.countedQuantity,
            <DifferenceValue
              value={record.countedQuantity - record.systemQuantity}
            />,
            record.reason,
            <Badge>{record.status}</Badge>,
            <IconButton icon="edit" label={`Edit ${record.reference}`} />,
          ])}
        />
        {!filteredRecords.length && (
          <div className="border-t border-line p-10 text-center text-sm text-muted">
            No adjustments match the current filters.
          </div>
        )}
      </Card>
    </div>
  )
}

type ProductRecord = {
  name: string
  sku: string
  category: string
  uom: string
  reorderLevel: string
  active: boolean
  demoUnitCost: string
  balance: {
    onHand: string
    freeToUse: string
    location: string
  }
}

type ProductFormState = {
  name: string
  sku: string
  category: string
  uom: string
  reorderLevel: string
  initialStock: string
  warehouse: string
  location: string
}

const emptyProduct: ProductFormState = {
  name: "",
  sku: "",
  category: "",
  uom: "",
  reorderLevel: "",
  initialStock: "",
  warehouse: "",
  location: "",
}

const initialProducts: ProductRecord[] = [
  {
    name: "Desk",
    sku: "DESK001",
    category: "Furniture",
    uom: "Units",
    reorderLevel: "10",
    active: true,
    demoUnitCost: "₹3,000",
    balance: { onHand: "50", freeToUse: "45", location: "WH / Stock 1" },
  },
  {
    name: "Table",
    sku: "TABLE001",
    category: "Furniture",
    uom: "Units",
    reorderLevel: "10",
    active: true,
    demoUnitCost: "₹3,000",
    balance: { onHand: "50", freeToUse: "50", location: "WH / Stock 2" },
  },
  {
    name: "Office Chair",
    sku: "CHAIR001",
    category: "Furniture",
    uom: "Units",
    reorderLevel: "8",
    active: true,
    demoUnitCost: "₹5,500",
    balance: { onHand: "24", freeToUse: "18", location: "WH / Stock 1" },
  },
  {
    name: "Storage Shelf",
    sku: "SHELF001",
    category: "Hardware",
    uom: "Units",
    reorderLevel: "5",
    active: true,
    demoUnitCost: "₹8,200",
    balance: { onHand: "14", freeToUse: "14", location: "WH / Stock 2" },
  },
]

function Products({ showToast }: { showToast: (message: string) => void }) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<any>({
    name: "", sku: "", category: "", uom: "", reorderLevel: "", initialStock: "", warehouse: "", location: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        setLoading(true)
        const [prodRes, catRes, whRes, locRes] = await Promise.all([
          productService.getProducts({ limit: "100" }),
          categoryService.getCategories({ limit: "100" }),
          warehouseService.getWarehouses({ limit: "100" }),
          locationService.getLocations({ limit: "100" })
        ])
        if (mounted) {
          setProducts(prodRes.data || [])
          setCategories(catRes.data || [])
          setWarehouses(whRes.data || [])
          setLocations(locRes.data || [])
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load products")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const update = (field: string, value: string) => {
    setForm((current: any) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: "" }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const payload: any = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        uom: form.uom,
      }
      if (form.reorderLevel) payload.reorderLevel = Number(form.reorderLevel)
      if (form.initialStock) {
        payload.initialStock = Number(form.initialStock)
        payload.warehouse = form.warehouse
        payload.location = form.location
      }

      await productService.createProduct(payload)
      showToast(`${form.name} created successfully.`)
      setFormOpen(false)
      setForm({ name: "", sku: "", category: "", uom: "", reorderLevel: "", initialStock: "", warehouse: "", location: "" })
      
      const prodRes = await productService.getProducts({ limit: "100" })
      setProducts(prodRes.data || [])
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to create product" })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      await productService.deleteProduct(id)
      showToast(`${name} deleted successfully.`)
      const prodRes = await productService.getProducts({ limit: "100" })
      setProducts(prodRes.data || [])
    } catch (err: any) {
      alert(err.message || "Failed to delete product")
    }
  }

  const visibleProducts = products.filter((product) => {
    const term = search.toLowerCase()
    return (
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      (product.category?.name || "").toLowerCase().includes(term)
    )
  })

  if (loading) return <div className="p-12 text-center text-muted">Loading products...</div>
  if (error) return <div className="p-12 text-center text-danger">{error}</div>

  return (
    <div className="grid gap-6">
      <PageHeading
        eyebrow="Inventory"
        title="Products"
        description="Review your product catalog and create new items."
      />
      {formOpen && (
        <Card>
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="font-bold text-ink">Create Product</h2>
              <p className="mt-1 text-xs text-muted">
                Product details and the opening stock balance.
              </p>
            </div>
            <IconButton
              icon="x"
              label="Close form"
              onClick={() => {
                setFormOpen(false)
                setForm({ name: "", sku: "", category: "", uom: "", reorderLevel: "", initialStock: "", warehouse: "", location: "" })
                setErrors({})
              }}
            />
          </div>
          <form onSubmit={submit} className="grid gap-5 p-6 md:grid-cols-2">
            {errors.form && <div className="md:col-span-2 text-danger text-sm">{errors.form}</div>}
            <Field label="Product Name">
              <Input
                value={form.name}
                onChange={(value) => update("name", value)}
                placeholder="e.g. Steel Storage Shelf"
              />
            </Field>
            <Field label="SKU / Code">
              <Input
                value={form.sku}
                onChange={(value) => update("sku", value)}
                placeholder="e.g. SSS-3091"
              />
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(value) => update("category", value)}
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Unit of Measure">
              <Input
                value={form.uom}
                onChange={(value) => update("uom", value)}
                placeholder="e.g. kg, units"
              />
            </Field>
            <Field label="Reorder Level">
              <Input
                type="number"
                value={form.reorderLevel}
                onChange={(value) => update("reorderLevel", value)}
                placeholder="e.g. 10"
              />
            </Field>
            <Field label="Initial Stock">
              <Input
                type="number"
                value={form.initialStock}
                onChange={(value) => update("initialStock", value)}
                placeholder="e.g. 20"
              />
            </Field>
            <Field label="Warehouse">
              <Select
                value={form.warehouse}
                onChange={(value) => update("warehouse", value)}
              >
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </Select>
            </Field>
            <Field label="Location">
              <Select
                value={form.location}
                onChange={(value) => update("location", value)}
              >
                <option value="">Select location</option>
                {locations.filter(l => !form.warehouse || l.warehouse === form.warehouse).map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </Select>
            </Field>
            <div className="rounded-lg border border-info/15 bg-info-soft p-3 text-xs leading-relaxed text-info md:col-span-2">
              Initial Stock creates the opening stock balance.
            </div>
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setFormOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" icon="check">
                Create Product
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
          <div className="w-full md:max-w-sm">
            <Input
              placeholder="Search products..."
              icon="search"
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="flex gap-2 md:ml-auto">
            <Button icon="plus" onClick={() => setFormOpen(true)}>
              New product
            </Button>
          </div>
        </div>
        {visibleProducts.length === 0 ? (
          <div className="p-8 text-center text-muted">No products found.</div>
        ) : (
          <DataTable
            columns={[
              "Product",
              "Category",
              "UoM",
              "Reorder Level",
              "Stock Quantity",
              "Stock Status",
              "Action",
            ]}
            rows={visibleProducts.map((product) => [
              <span>
                <span className="block font-bold text-ink">{product.name}</span>
                <span className="block text-xs text-subtle">{product.sku}</span>
              </span>,
              product.category?.name || "N/A",
              product.uom,
              product.reorderLevel,
              product.stockQuantity,
              <Badge>{product.stockStatus}</Badge>,
              <Button
                variant="secondary"
                icon="x"
                onClick={() => handleDelete(product._id, product.name)}
              >
                Delete
              </Button>,
            ])}
          />
        )}
      </Card>
    </div>
  )
}

function MoveHistory() {
  const [view, setView] = useState<"list" | "kanban">("list")
  const rows = [
    [
      "WH/IN/0001",
      "24/05/2025",
      "Azure Interior",
      "Vendor",
      "WH/Stock 1",
      "+6",
      "Ready",
    ],
    [
      "WH/OUT/0002",
      "24/05/2025",
      "Azure Interior",
      "WH/Stock 1",
      "Customer",
      "−4",
      "Ready",
    ],
    [
      "WH/OUT/0002",
      "24/05/2025",
      "Azure Interior",
      "WH/Stock 2",
      "Customer",
      "−2",
      "Ready",
    ],
    [
      "ADJ/0008",
      "23/05/2025",
      "Internal",
      "WH/Stock 1",
      "WH/Stock 1",
      "+2",
      "Done",
    ],
  ]
  return (
    <div className="grid gap-6">
      <PageHeading
        eyebrow="Inventory"
        title="Move History"
        description="Every inventory movement between source and destination locations."
        action={<Button icon="plus">New</Button>}
      />
      <Card className="overflow-hidden">
        <ListToolbar
          search="Search by reference or contact…"
          view={view}
          setView={setView}
        />
        {view === "list" ? (
          <DataTable
            columns={[
              "Reference",
              "Date",
              "Contact",
              "From",
              "To",
              "Quantity",
              "Status",
            ]}
            rows={rows.map((row) => [
              <span className="font-bold text-brand">{row[0]}</span>,
              ...row.slice(1, 5),
              <span
                className={`font-bold ${
                  row[5].startsWith("+") ? "text-success" : "text-danger"
                }`}
              >
                {row[5]}
              </span>,
              <Badge>{row[6]}</Badge>,
            ])}
          />
        ) : (
          <Kanban
            rows={rows.map((row) => [
              row[0],
              row[3],
              row[4],
              row[2],
              row[1],
              row[6],
            ])}
          />
        )}
        <div className="border-t border-line bg-surface/60 px-5 py-4 text-xs text-muted">
          A reference with multiple products is displayed across multiple rows.
          Incoming movements are green; outgoing movements are red.
        </div>
      </Card>
    </div>
  )
}

function WarehouseSettings({
  locations,
  setPage,
  showToast,
}: {
  locations?: boolean
  setPage: (page: Page) => void
  showToast: (message: string) => void
}) {
  return (
    <div className="grid gap-6">
      <PageHeading
        eyebrow="Settings"
        title={locations ? "Locations" : "Warehouse"}
        description={
          locations
            ? "Define the rooms, zones, and stock locations inside a warehouse."
            : "Configure your primary warehouse details and address."
        }
        action={
          <div className="flex gap-2">
            <Button
              variant={locations ? "secondary" : "primary"}
              icon="warehouse"
              onClick={() => setPage("Warehouse")}
            >
              Warehouse
            </Button>
            <Button
              variant={locations ? "primary" : "secondary"}
              icon="pin"
              onClick={() => setPage("Locations")}
            >
              Locations
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <Card>
          <div className="border-b border-line p-5">
            <h2 className="font-bold text-ink">
              {locations ? "Location details" : "Warehouse details"}
            </h2>
            <p className="mt-1 text-xs text-muted">
              Fields follow the structure defined in the system workflow.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              showToast(
                `${locations ? "Location" : "Warehouse"} saved successfully.`,
              )
            }}
            className="grid gap-5 p-6"
          >
            <Field label="Name">
              <Input
                defaultValue={locations ? "Stock Room 1" : "Central Warehouse"}
              />
            </Field>
            <Field label="Short Code">
              <Input defaultValue={locations ? "STOCK1" : "WH"} />
            </Field>
            {locations ? (
              <Field label="Warehouse">
                <Select>
                  <option>WH — Central Warehouse</option>
                </Select>
              </Field>
            ) : (
              <Field label="Address">
                <Input defaultValue="1400 Commerce Avenue, Austin, TX" />
              </Field>
            )}
            <div className="flex justify-end">
              <Button type="submit" icon="check">
                Save {locations ? "location" : "warehouse"}
              </Button>
            </div>
          </form>
        </Card>
        <Card className="p-6">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
            <Icon name={locations ? "pin" : "warehouse"} />
          </span>
          <h2 className="mt-5 text-lg font-bold text-ink">
            {locations ? "Warehouse locations" : "Central Warehouse"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {locations
              ? "A warehouse can hold multiple locations, such as stock rooms, receiving zones, and dispatch areas."
              : "The short code is used to generate operation references and uniquely identify this warehouse."}
          </p>
          {locations && (
            <div className="mt-5 divide-y divide-line rounded-lg border border-line">
              {["Stock Room 1", "Stock Room 2", "Receiving"].map(
                (location, index) => (
                  <div
                    key={location}
                    className="flex items-center justify-between p-3"
                  >
                    <span className="text-sm font-semibold text-ink">
                      {location}
                    </span>
                    <span className="text-xs text-muted">
                      {index < 2 ? `WH/Stock ${index + 1}` : "WH/Input"}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [signup, setSignup] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    try {
      const response = await authService.login({ email, password })
      localStorage.setItem("token", response.token)
      const user = await authService.getMe()
      onLogin(user.data || user)
    } catch (err: any) {
      setError(err.message || "Login failed")
    }
  }

  return (
    <main className="grid min-h-screen bg-page lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-sidebar p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand">
            <Icon name="box" />
          </span>
          <span className="text-xl font-bold">StockSense</span>
        </div>
        <div className="my-auto max-w-xl">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-sidebar-ink">
            Centralized inventory operations
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight">
            Stock that makes
            <br />
            sense.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-sidebar-muted">
            Receive products, deliver orders, track every move, and keep your
            warehouse accurate from one dependable workspace.
          </p>
          <div className="mt-10 flex items-center gap-6 text-sm text-sidebar-ink">
            <span className="flex items-center gap-2">
              <Icon name="check" className="size-4 text-success" />
              Real-time stock
            </span>
            <span className="flex items-center gap-2">
              <Icon name="check" className="size-4 text-success" />
              Complete traceability
            </span>
          </div>
        </div>
        <p className="text-xs text-sidebar-muted">
          &copy; 2025 StockSense Inventory Management
        </p>
      </section>
      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-white">
              <Icon name="box" />
            </span>
            <span className="text-xl font-bold text-ink">StockSense</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            {signup ? "Create an account" : "Welcome back"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            {signup ? "Sign up for StockSense" : "Sign in to StockSense"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {signup
              ? "Enter your details to create a warehouse account."
              : "Enter your email and password to continue."}
          </p>
          {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <form onSubmit={submit} className="mt-8 grid gap-5">
            <Field label="Email ID">
              <Input
                value={email}
                onChange={setEmail}
                placeholder="Enter email"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter password"
              />
            </Field>
            {!signup && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm font-semibold text-brand hover:text-brand-strong"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            <Button type="submit" className="w-full">
              {signup ? "Sign Up" : "Sign In"}
            </Button>
          </form>
          <p className="mt-7 text-center text-sm text-muted">
            {signup ? "Already have an account?" : "New to StockSense?"}{" "}
            <button
              type="button"
              onClick={() => setSignup(!signup)}
              className="font-bold text-brand"
            >
              {signup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

function Toast({ message, close }: { message: string close: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-success/20 bg-white p-4 shadow-pop">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success-soft text-success">
        <Icon name="check" className="size-4" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-ink">Success</span>
        <span className="mt-0.5 block text-xs text-muted">{message}</span>
      </span>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss notification"
        className="text-muted"
      >
        <Icon name="x" className="size-4" />
      </button>
    </div>
  )
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<Page>("Dashboard")
  const [toast, setToast] = useState("")
  const showToast = (message: string) => setToast(message)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data || res);
          setLoggedIn(true);
        } catch (err) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const content = useMemo(() => {
    if (page === "Dashboard") return <Dashboard setPage={setPage} />
    if (page === "Receipts")
      return <OperationsList delivery={false} showToast={showToast} />
    if (page === "Delivery")
      return <OperationsList delivery showToast={showToast} />
    if (page === "Internal Transfers")
      return <InternalTransfers showToast={showToast} />
    if (page === "Inventory Adjustments")
      return <InventoryAdjustments showToast={showToast} />
    if (page === "Products") return <Products showToast={showToast} />
    if (page === "Move History") return <MoveHistory />
    if (page === "Warehouse")
      return <WarehouseSettings setPage={setPage} showToast={showToast} />
    return (
      <WarehouseSettings locations setPage={setPage} showToast={showToast} />
    )
  }, [page])

  if (loading) {
    return <div className="min-h-screen bg-page flex items-center justify-center">Loading...</div>;
  }

  if (!loggedIn)
    return (
      <Login
        onLogin={(userData) => {
          setUser(userData)
          setLoggedIn(true)
          setPage("Dashboard")
          showToast("Signed in successfully.")
        }}
      />
    )

  return (
    <div className="min-h-screen bg-page text-body">
      <AppHeader
        page={page}
        setPage={setPage}
        onLogout={() => {
          localStorage.removeItem("token");
          setUser(null);
          setLoggedIn(false);
        }}
      />
      <main className="mx-auto max-w-screen-2xl p-4 md:p-7 xl:p-8">
        {content}
      </main>
      {toast && <Toast message={toast} close={() => setToast("")} />}
    </div>
  )
}
