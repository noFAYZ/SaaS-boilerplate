
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Input,
  Avatar,
  Divider,
  Chip,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Tabs,
  Tab,
  addToast,
  Progress,
  Badge
} from '@heroui/react';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  Camera, 
  Copy, 
  CheckCircle2, 
  Globe,
  MapPin,
  Phone,
  Briefcase,
  Link2,
  Star,
  Activity,
  Lock,
  Bell,
  Palette,
  Download,
  Trash2,
  ExternalLink,
  Crown,
  Zap,
  Edit3,
  Save,
  X,
  Award,
  TrendingUp,
  Clock,
  Fingerprint,
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  UserCheck,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const UserProfilePage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: is2FAOpen, onOpen: on2FAOpen, onClose: on2FAClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState('general');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: '',
    location: '',
    phone: '',
    company: '',
    job_title: '',
    linkedin: '',
    twitter: '',
    github: '',
    timezone: '',
    department: '',
    skills: ''
  });

  // Calculate profile completion percentage
  useEffect(() => {
    if (user?.user_metadata) {
      const fields = ['full_name', 'bio', 'website', 'location', 'phone', 'company', 'job_title', 'avatar_url'];
      const filledFields = fields.filter(field => 
        user.user_metadata[field] && user.user_metadata[field].trim() !== ''
      ).length;
      const completion = Math.round((filledFields / fields.length) * 100);
      setProfileCompletion(completion);
    }
  }, [user]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user?.user_metadata) {
      setFormData({
        full_name: user.user_metadata.full_name || '',
        bio: user.user_metadata.bio || '',
        website: user.user_metadata.website || '',
        location: user.user_metadata.location || '',
        phone: user.user_metadata.phone || '',
        company: user.user_metadata.company || '',
        job_title: user.user_metadata.job_title || '',
        linkedin: user.user_metadata.linkedin || '',
        twitter: user.user_metadata.twitter || '',
        github: user.user_metadata.github || '',
        timezone: user.user_metadata.timezone || '',
        department: user.user_metadata.department || '',
        skills: user.user_metadata.skills || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: formData
      });

      if (error) {
        addToast({ title: 'Error updating profile' });
        console.error('Error updating profile:', error);
      } else {
        addToast({ title: 'Profile updated successfully' });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({ title: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user?.user_metadata) {
      setFormData({
        full_name: user.user_metadata.full_name || '',
        bio: user.user_metadata.bio || '',
        website: user.user_metadata.website || '',
        location: user.user_metadata.location || '',
        phone: user.user_metadata.phone || '',
        company: user.user_metadata.company || '',
        job_title: user.user_metadata.job_title || '',
        linkedin: user.user_metadata.linkedin || '',
        twitter: user.user_metadata.twitter || '',
        github: user.user_metadata.github || '',
        timezone: user.user_metadata.timezone || '',
        department: user.user_metadata.department || '',
        skills: user.user_metadata.skills || ''
      });
    }
    setIsEditing(false);
  };

  const handleCopyId = async () => {
    if (!user?.id) return;
    
    try {
      await navigator.clipboard.writeText(user.id);
      setIsCopied(true);
      addToast({ title: 'User ID copied to clipboard' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({ title: 'File too large. Please select an image under 5MB' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        addToast({ title: 'Error uploading avatar' });
        return;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });

      if (error) {
        addToast({ title: 'Error updating profile picture' });
      } else {
        addToast({ title: 'Profile picture updated successfully' });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addToast({ title: 'Error uploading avatar' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const ProfileField = ({ 
    label, 
    value, 
    field, 
    type = 'text', 
    placeholder, 
    icon,
    isTextarea = false,
    isRequired = false
  }: {
    label: string;
    value: string;
    field: string;
    type?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    isTextarea?: boolean;
    isRequired?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        {icon}
        {label}
        {isRequired && <span className="text-warning">*</span>}
      </label>
      {isEditing ? (
        isTextarea ? (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            minRows={2}
            maxRows={4}
            variant="bordered"
            size="sm"
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            disabled={field === 'email'}
            variant="bordered"
            size="sm"
          />
        )
      ) : (
        <div className="px-3 py-2 bg-default-50 rounded-lg min-h-[36px] flex items-center border border-default-200">
          {value ? (
            <span className="text-sm text-foreground">{value}</span>
          ) : (
            <span className="text-default-400 italic text-sm">Not provided</span>
          )}
        </div>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-default-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const membershipDuration = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Compact Header */}
        <Card className="border-default-200">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    src={user.user_metadata?.avatar_url}
                    size="lg"
                    className="w-16 h-16"
                    fallback={
                      <div className="bg-gradient-to-br from-primary to-warning flex items-center justify-center w-full h-full text-white text-xl font-semibold">
                        {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                    }
                  />
                  {profileCompletion >= 80 && (
                    <Badge content={<Crown size={10} />} color="warning" className="absolute -top-1 -right-1">
                      <div />
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                      {user.user_metadata?.full_name || 'Complete your profile'}
                    </h1>
                    {profileCompletion >= 80 && (
                      <Chip color="warning" variant="flat" size="sm">
                        <Crown size={10} className="mr-1" />
                        Complete
                      </Chip>
                    )}
                  </div>
                  <p className="text-default-600 text-sm">
                    {user.user_metadata?.job_title || user.email}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-default-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {membershipDuration}d member
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity size={12} />
                      {getTimeAgo(user.last_sign_in_at || user.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Compact Progress */}
                <div className="text-center min-w-[80px]">
                  <div className="text-lg font-bold text-warning">{profileCompletion}%</div>
                  <Progress 
                    value={profileCompletion} 
                    color="warning"
                    size="sm"
                    className="w-16"
                  />
                  <div className="text-xs text-default-500 mt-1">Complete</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <Button
                        color="primary"
                        startContent={<Edit3 size={16} />}
                        onPress={() => setIsEditing(true)}
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="bordered"
                        startContent={<Download size={16} />}
                        size="sm"
                      >
                        Export
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        color="success"
                        onPress={handleSave}
                        isLoading={isLoading}
                        startContent={!isLoading ? <Save size={16} /> : null}
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button
                        variant="bordered"
                        onPress={handleCancel}
                        isDisabled={isLoading}
                        startContent={<X size={16} />}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Compact Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Actions */}
            <Card className="border-default-200">
              <CardHeader className="pb-2">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Zap size={16} className="text-warning" />
                  Quick Actions
                </h4>
              </CardHeader>
              <CardBody className="space-y-2 pt-0">
                <Button
                  variant="flat"
                  startContent={isUploading ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                  onPress={() => fileInputRef.current?.click()}
                  className="w-full justify-start h-9"
                  isDisabled={isUploading}
                  size="sm"
                >
                  {isUploading ? `Uploading ${uploadProgress}%` : 'Update Avatar'}
                </Button>
                <Button
                  variant="flat"
                  startContent={<Key size={14} />}
                  as="a"
                  href="/update-password"
                  className="w-full justify-start h-9"
                  size="sm"
                >
                  Change Password
                </Button>
                <Button
                  variant="flat"
                  startContent={<Shield size={14} />}
                  onPress={on2FAOpen}
                  className="w-full justify-start h-9"
                  size="sm"
                >
                  Security Settings
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </CardBody>
            </Card>

            {/* Compact Stats */}
            <Card className="border-default-200">
              <CardBody className="p-4 space-y-3">
                <h4 className="text-base font-semibold text-foreground">Account Status</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">Email</span>
                    <Chip
                      color={user.email_confirmed_at ? 'success' : 'warning'}
                      variant="flat"
                      size="sm"
                      startContent={user.email_confirmed_at ? <CheckCircle size={10} /> : <Clock size={10} />}
                    >
                      {user.email_confirmed_at ? 'Verified' : 'Pending'}
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">Profile</span>
                    <Chip
                      color={profileCompletion >= 80 ? 'warning' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {profileCompletion >= 80 ? 'Complete' : 'Incomplete'}
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">User ID</span>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={handleCopyId}
                      endContent={isCopied ? <CheckCircle2 size={10} className="text-success" /> : <Copy size={10} />}
                      className="text-xs font-mono h-6 min-w-0 px-2"
                    >
                      {user.id.slice(0, 8)}...
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Social Links */}
            <Card className="border-default-200">
              <CardHeader className="pb-2">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Globe size={16} className="text-primary" />
                  Social Links
                </h4>
              </CardHeader>
              <CardBody className="space-y-2 pt-0">
                {[
                  { key: 'website', label: 'Website', icon: <Globe size={14} />, value: user.user_metadata?.website },
                  { key: 'linkedin', label: 'LinkedIn', icon: <Link2 size={14} />, value: user.user_metadata?.linkedin },
                  { key: 'twitter', label: 'Twitter', icon: <Link2 size={14} />, value: user.user_metadata?.twitter },
                  { key: 'github', label: 'GitHub', icon: <Link2 size={14} />, value: user.user_metadata?.github },
                ].map(({ key, label, icon, value }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="text-sm">{label}</span>
                    </div>
                    {value ? (
                      <Button
                        size="sm"
                        variant="light"
                        endContent={<ExternalLink size={10} />}
                        as="a"
                        href={value}
                        target="_blank"
                        className="text-xs h-6 min-w-0 px-2"
                      >
                        Visit
                      </Button>
                    ) : (
                      <span className="text-xs text-default-400">Not set</span>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 ">
            <Card className="border-default-200 p-4">
              <Tabs 
                selectedKey={activeTab} 
                onSelectionChange={(key) => setActiveTab(key as string)}
           variant='light'
                classNames={{
                  base:"rounded-2xl lg:rounded-3xl  bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5",
                  tabList: ' w-full rounded-2xl lg:rounded-3xl border border-divider bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl animate-in fade-in-0 duration-100 slide-in-from-bottom-6 p-2 ',
                  tab: `relative flex items-center gap-2 px-2 py-1 rounded-2xl text-sm font-medium  `,
                  cursor: 'gap-2 px-2 py-1 rounded-xl text-sm font-medium ',
            
       
                }}
                size="sm"

              >
                
                <Tab key="general" title="General">
                  <CardBody className="space-y-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileField
                        label="Full Name"
                        value={formData.full_name}
                        field="full_name"
                        placeholder="Enter your full name"
                        icon={<User size={14} />}
                        isRequired
                      />
                      <ProfileField
                        label="Email Address"
                        value={user.email || ''}
                        field="email"
                        type="email"
                        icon={<Mail size={14} />}
                      />
                      <ProfileField
                        label="Phone Number"
                        value={formData.phone}
                        field="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        icon={<Phone size={14} />}
                      />
                      <ProfileField
                        label="Location"
                        value={formData.location}
                        field="location"
                        placeholder="City, Country"
                        icon={<MapPin size={14} />}
                      />
                      <ProfileField
                        label="Company"
                        value={formData.company}
                        field="company"
                        placeholder="Your company"
                        icon={<Building size={14} />}
                      />
                      <ProfileField
                        label="Job Title"
                        value={formData.job_title}
                        field="job_title"
                        placeholder="Your position"
                        icon={<Star size={14} />}
                      />
                    </div>
                    
                    <ProfileField
                      label="Bio"
                      value={formData.bio}
                      field="bio"
                      placeholder="Tell us about yourself..."
                      icon={<FileText size={14} />}
                      isTextarea
                    />
                  </CardBody>
                </Tab>

                <Tab key="professional" title="Professional">
                  <CardBody className="space-y-4 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileField
                        label="Department"
                        value={formData.department}
                        field="department"
                        placeholder="Engineering, Marketing..."
                        icon={<Building size={14} />}
                      />
                      <ProfileField
                        label="Timezone"
                        value={formData.timezone}
                        field="timezone"
                        placeholder="America/Los_Angeles"
                        icon={<Clock size={14} />}
                      />
                    </div>
                    
                    <ProfileField
                      label="Skills & Expertise"
                      value={formData.skills}
                      field="skills"
                      placeholder="JavaScript, React, Product Management..."
                      icon={<Award size={14} />}
                      isTextarea
                    />
                  </CardBody>
                </Tab>

                <Tab key="social" title="Social & Links">
                  <CardBody className="space-y-4 p-6">
                    <div className="grid grid-cols-1 gap-4">
                      <ProfileField
                        label="Website"
                        value={formData.website}
                        field="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        icon={<Globe size={14} />}
                      />
                      <ProfileField
                        label="LinkedIn"
                        value={formData.linkedin}
                        field="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        icon={<Link2 size={14} />}
                      />
                      <ProfileField
                        label="Twitter"
                        value={formData.twitter}
                        field="twitter"
                        type="url"
                        placeholder="https://twitter.com/yourusername"
                        icon={<Link2 size={14} />}
                      />
                      <ProfileField
                        label="GitHub"
                        value={formData.github}
                        field="github"
                        type="url"
                        placeholder="https://github.com/yourusername"
                        icon={<Link2 size={14} />}
                      />
                    </div>
                  </CardBody>
                </Tab>

                <Tab key="security" title="Security">
                  <CardBody className="space-y-6 p-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <Shield size={18} />
                        Security Settings
                      </h4>
                      <Button
                        variant="light"
                        size="sm"
                        startContent={showSensitiveInfo ? <EyeOff size={14} /> : <Eye size={14} />}
                        onPress={() => setShowSensitiveInfo(!showSensitiveInfo)}
                      >
                        {showSensitiveInfo ? 'Hide' : 'Show'} Details
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-200">
                        <div className="flex items-center gap-3">
                          <Fingerprint size={20} />
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-default-600">
                              {user.phone_confirmed_at ? 'Enabled via SMS' : 'Not configured'}
                            </p>
                          </div>
                        </div>
                        <Switch 
                          isSelected={!!user.phone_confirmed_at}
                          color="success"
                          onValueChange={on2FAOpen}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-200">
                        <div className="flex items-center gap-3">
                          <Bell size={20} />
                          <div>
                            <p className="font-medium">Security Notifications</p>
                            <p className="text-sm text-default-600">
                              Email alerts for suspicious activity
                            </p>
                          </div>
                        </div>
                        <Switch defaultSelected color="primary" />
                      </div>

                      {showSensitiveInfo && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg border border-default-200">
                            <div className="flex items-center gap-3">
                              <Palette size={16} />
                              <div>
                                <p className="font-medium text-sm">Dark Mode</p>
                                <p className="text-xs text-default-600">Toggle dark theme</p>
                              </div>
                            </div>
                            <Switch color="primary" size="sm" />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg border border-default-200">
                            <div className="flex items-center gap-3">
                              <Bell size={16} />
                              <div>
                                <p className="font-medium text-sm">Email Notifications</p>
                                <p className="text-xs text-default-600">Receive email updates</p>
                              </div>
                            </div>
                            <Switch defaultSelected color="primary" size="sm" />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg border border-default-200">
                            <div className="flex items-center gap-3">
                              <Activity size={16} />
                              <div>
                                <p className="font-medium text-sm">Usage Analytics</p>
                                <p className="text-xs text-default-600">Help improve the platform</p>
                              </div>
                            </div>
                            <Switch defaultSelected color="primary" size="sm" />
                          </div>
                        </div>) }
                      </div>
                    
                  </CardBody>
                </Tab>

                <Tab key="danger" title={
                  <div className="flex items-center gap-1 text-danger">
                    <AlertTriangle size={14} />
                    <span>Danger Zone</span>
                  </div>
                }>
                  <CardBody className="space-y-6 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-danger/10 rounded-lg">
                          <AlertTriangle size={20} className="text-danger" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-danger">Danger Zone</h4>
                          <p className="text-sm text-default-600">
                            These actions are permanent and cannot be undone
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 space-y-4">
                        <div className="space-y-3">
                          <Button
                            variant="bordered"
                            color="warning"
                            className="w-full justify-start"
                            startContent={<Download size={16} />}
                          >
                            <div className="text-left">
                              <p className="font-medium">Export All Data</p>
                              <p className="text-xs text-default-500">Download your complete profile data</p>
                            </div>
                          </Button>
                          
                          <Button
                            color="danger"
                            variant="bordered"
                            className="w-full justify-start"
                            startContent={<Trash2 size={16} />}
                            onPress={onDeleteOpen}
                          >
                            <div className="text-left">
                              <p className="font-medium">Delete Account</p>
                              <p className="text-xs text-danger-600">Permanently remove your account and all data</p>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Tab>
              </Tabs>
            </Card>
          </div>
        </div>

        {/* 2FA Modal */}
        <Modal 
          isOpen={is2FAOpen} 
          onClose={on2FAClose}
          size="md"
        >
          <ModalContent>
            <ModalHeader className="flex items-center gap-2">
              <Shield size={20} />
              Two-Factor Authentication
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="text-center p-4 bg-default-50 rounded-lg">
                  <Fingerprint size={32} className="mx-auto text-primary mb-2" />
                  <h4 className="font-semibold mb-1">Enhanced Security</h4>
                  <p className="text-sm text-default-600">
                    Add an extra layer of protection to your account
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-primary/30 hover:border-primary cursor-pointer">
                    <CardBody className="text-center p-4">
                      <Smartphone size={24} className="mx-auto text-primary mb-2" />
                      <h5 className="font-medium text-sm">SMS</h5>
                      <p className="text-xs text-default-600">Text message codes</p>
                    </CardBody>
                  </Card>

                  <Card className="border-warning/30 hover:border-warning cursor-pointer">
                    <CardBody className="text-center p-4">
                      <Key size={24} className="mx-auto text-warning mb-2" />
                      <h5 className="font-medium text-sm">App</h5>
                      <p className="text-xs text-default-600">Authenticator app</p>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={on2FAClose} size="sm">
                Cancel
              </Button>
              <Button color="primary" onPress={on2FAClose} size="sm">
                Set Up 2FA
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Account Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalContent>
            <ModalHeader className="text-danger flex items-center gap-2">
              <AlertTriangle size={20} />
              Delete Account
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="text-center p-4 bg-danger/10 rounded-lg border border-danger/20">
                  <Trash2 size={32} className="mx-auto text-danger mb-2" />
                  <p className="text-danger font-medium">
                    This will permanently delete your account
                  </p>
                </div>

                <div className="bg-danger/5 p-3 rounded-lg border border-danger/20">
                  <p className="text-sm text-danger font-medium mb-2">This will delete:</p>
                  <ul className="text-sm text-danger space-y-1">
                    <li className="flex items-center gap-2">
                      <XCircle size={12} />
                      Your profile and account information
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle size={12} />
                      All your data and preferences
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle size={12} />
                      Access to all services
                    </li>
                  </ul>
                </div>

                <Input
                  placeholder="Type 'DELETE' to confirm"
                  variant="bordered"
                  color="danger"
                  size="sm"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onDeleteClose} size="sm">
                Cancel
              </Button>
              <Button color="danger" onPress={onDeleteClose} size="sm">
                Delete Account
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </ProtectedRoute>
  );
};

export default UserProfilePage;