import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Hash,
    Calendar,
    Briefcase,
    Globe2
} from "lucide-react";

const ClientProfile = ({ isOpen, onClose, client }) => {
    if (!client) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Client Profile"
            size="xl"
            className="overflow-hidden"
            contentClassName="pb-2 px-2 overflow-hidden"
        >
            <div className="flex flex-col h-full max-h-[80vh]">
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <Building2 className="h-10 w-10 text-indigo-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {client.name}
                                </h3>
                                <p className="text-slate-500 text-sm">{client.company_name || 'Individual Client'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={client.is_active ? "success" : "error"}>
                                        {client.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-indigo-500" />
                                    Contact Details
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email Address</p>
                                            <p className="text-slate-900">{client.email || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phone Number</p>
                                            <p className="text-slate-900">{client.phone || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Globe className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Website</p>
                                            {client.website ? (
                                                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                    {client.website}
                                                </a>
                                            ) : (
                                                <p className="text-slate-900">N/A</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Information */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-indigo-500" />
                                    Business Info
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Hash className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tax ID / Registration</p>
                                            <p className="text-slate-900">{client.tax_id || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Primary Address</p>
                                            <p className="text-slate-900">
                                                {client.address_line_1}
                                                {client.address_line_2 && `, ${client.address_line_2}`}
                                                {client.city && `, ${client.city}`}
                                                {client.state && `, ${client.state}`}
                                                {client.postal_code && ` - ${client.postal_code}`}
                                                {client.country && `, ${client.country}`}
                                                {(!client.address_line_1 && !client.city) && "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Projects Section (if available) */}
                        {client.projects && client.projects.length > 0 && (
                            <div className="pt-4">
                                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <Globe2 className="h-4 w-4 text-indigo-500" />
                                    Active Projects ({client.projects.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {client.projects.map((project) => (
                                        <div key={project.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{project.name}</p>
                                                <p className="text-xs text-slate-500 capitalize">{project.status}</p>
                                            </div>
                                            <Badge variant={project.priority === 'high' ? 'error' : project.priority === 'medium' ? 'warning' : 'gray'}>
                                                {project.priority}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>Added on: {new Date(client.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>Last updated: {new Date(client.updated_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl -mx-6 -mb-6 mt-4">
                    <Button class="btn btn-primary" onClick={onClose}>
                        Close Profile
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ClientProfile;
