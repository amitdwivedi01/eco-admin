import { NavLink, useNavigate } from "react-router-dom";
import { Users, Ticket, LogOut } from "lucide-react";
import { logout } from "../utils/auth";

const navigation = [
  {
    label: "Menu",
    items: [
      { name: "Visitors", path: "/visitors", icon: Users },
      {
        name: "Conference",
        path: "/conference-registrations",
        icon: Ticket,
      },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
          E
        </div>

        <div>
          <h1 className="font-bold tracking-tight text-slate-900 text-start">
            ECO
          </h1>
          <h1 className="font-bold tracking-tight text-slate-900 text-start">
            Environment
          </h1>
        </div>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
        {navigation.map((group) => (
          <div key={group.label}>
            <div className="space-y-1">
              {group.items.map(({ name, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/visitors"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={1.8} />
                  {name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
