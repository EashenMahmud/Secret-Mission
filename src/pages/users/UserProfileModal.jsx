import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  UserCheck,
} from "lucide-react";
import { getImageUrl } from "../../lib/utils";

const UserProfileModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      size="xl"
      className="overflow-hidden"
      contentClassName="pb-2 px-2 overflow-hidden"
    >
      <div className="flex flex-col h-full max-h-[80vh]">
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-4 p-4 bg-[var(--bg-app)] rounded-lg">
              <div className="h-16 w-16 rounded-full bg-[var(--bg-skeleton)] flex items-center justify-center overflow-hidden border-2 border-[var(--border-main)]">
                {user.profile_picture ? (
                  <img
                    src={getImageUrl(user.profile_picture)}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[var(--text-main)]">
                  {user.name}
                </h3>
                <p className="text-[var(--text-muted)]">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.user_type === "Admin" ? "info" : "gray"}>
                    {user.user_type}
                  </Badge>
                  <Badge variant={user.is_active ? "success" : "error"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-[var(--text-main)] border-b border-[var(--border-main)] pb-2">
                  Employee Information
                </h4>

                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Employee Code</p>
                    <p className="font-medium text-[var(--text-main)]">{user.employee_code || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">HRM ID</p>
                    <p className="font-medium text-[var(--text-main)]">{user.hrm_id || "N/A"}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Phone</p>
                      <p className="font-medium text-[var(--text-main)]">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Organization Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-[var(--text-main)] border-b border-[var(--border-main)] pb-2">
                  Organization
                </h4>

                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Department</p>
                    <p className="font-medium text-[var(--text-main)]">
                      {user.department?.name || "Not Assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Designation</p>
                    <p className="font-medium text-[var(--text-main)]">
                      {user.designation?.name || "Not Assigned"}
                    </p>
                  </div>
                </div>

                {user.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Address</p>
                      <p className="font-medium text-[var(--text-main)]">{user.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            {(user.created_at || user.updated_at) && (
              <div className="pt-4 border-t border-[var(--border-main)]">
                <h4 className="font-medium text-[var(--text-main)] mb-3">
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {user.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-muted)]">Created:</span>
                      <span className="font-medium text-[var(--text-main)]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {user.updated_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-muted)]">Updated:</span>
                      <span className="font-medium text-[var(--text-main)]">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex justify-end gap-3 p-6 bg-[var(--bg-app)] border-t border-[var(--border-main)] rounded-b-xl -mx-6 -mb-5 mt-4">
          <Button className="btn btn-primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileModal;
