import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getMenuByRole } from '../../routes/menu';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { role } = useSelector((state) => state.auth);
    const menuItems = getMenuByRole(role);
    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpand = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const isParentActive = (item) => {
        if (item.path && isActive(item.path)) return true;
        if (item.children) {
            return item.children.some(child => isActive(child.path));
        }
        return false;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-dark-900 border-r border-dark-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-dark-700">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">SM</span>
                        </div>
                        <span className="text-xl font-bold text-gradient">Secret Mission</span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden text-dark-400 hover:text-dark-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedItems[item.id];
                        const active = isParentActive(item);

                        return (
                            <div key={item.id}>
                                {hasChildren ? (
                                    <>
                                        <button
                                            onClick={() => toggleExpand(item.id)}
                                            className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg
                        transition-all duration-200
                        ${active
                                                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                                                    : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                                                }
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>
                                        {isExpanded && (
                                            <div className="ml-4 mt-1 space-y-1">
                                                {item.children.map((child) => {
                                                    const ChildIcon = child.icon;
                                                    const childActive = isActive(child.path);
                                                    return (
                                                        <Link
                                                            key={child.id}
                                                            to={child.path}
                                                            className={`
                                flex items-center gap-3 px-4 py-2 rounded-lg
                                transition-all duration-200
                                ${childActive
                                                                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                                                                    : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                                                                }
                              `}
                                                        >
                                                            <ChildIcon className="w-4 h-4" />
                                                            <span className="text-sm font-medium">{child.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${active
                                                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-glow'
                                                : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-dark-700">
                    <div className="px-4 py-3 bg-dark-800/50 rounded-lg">
                        <p className="text-xs text-dark-400">Version 1.0.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
