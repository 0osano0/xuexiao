import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  BookOpen, 
  Users, 
  Trophy, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Award,
  Star,
  GraduationCap,
  Building2,
  Heart,
  Plus,
  Edit,
  Trash2,
  LogOut,
  LogIn,
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  UserPlus,
  Shield,
  Lock,
  Settings,
  Layout,
  Info,
  Zap,
  Camera,
  ArrowRight,
  Quote,
  Search,
  Sparkles
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where,
  getDoc,
  setDoc,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface NavItem {
  label: string;
  id: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  coverImage: string;
  author: string;
  category: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublished: boolean;
}

interface AppUser {
  uid: string;
  username: string;
  displayName: string;
  password?: string;
  role: 'admin' | 'editor';
  createdAt: Timestamp;
}

interface SiteConfig {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    bgImage: string;
    videoUrl?: string;
  };
  intro: {
    tag: string;
    title: string;
    content: string;
    image: string;
    years: string;
  };
  advantages: { icon: string; title: string; desc: string }[];
  courses: { title: string; category: string; img: string }[];
  faculty: { name: string; title: string; role: string; img: string }[];
  campus: { title: string; img: string; size: 'large' | 'small' }[];
  achievements: { number: string; label: string; icon: string }[];
  footer: {
    intro: string;
    copyright: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
  };
}

const DEFAULT_CONFIG: SiteConfig = {
  hero: {
    title: "漳州正兴学校",
    subtitle: "人正则立，品正则兴",
    description: "正德兴学 · 追求卓越 · 育才报国",
    bgImage: "https://picsum.photos/seed/school-campus/1920/1080"
  },
  intro: {
    tag: "关于我们",
    title: "正德兴学，追求卓越",
    content: "漳州正兴学校坐落于美丽的九龙江畔，是一所集小学、初中、高中为一体的现代化全日制寄宿学校。学校秉承“正德兴学”的办学理念，致力于培养具有家国情怀、国际视野、创新精神的时代新人。",
    image: "https://picsum.photos/seed/school-building/800/600",
    years: "20+"
  },
  advantages: [
    { icon: "Award", title: "卓越教学质量", desc: "连续多年中高考成绩名列前茅，升学率稳步提升。" },
    { icon: "Users", title: "精英管理团队", desc: "由资深教育专家领衔，实行精细化、人性化管理。" },
    { icon: "Globe", title: "国际化视野", desc: "与多所海外名校建立合作，提供多元化升学通道。" },
    { icon: "Star", title: "个性化培养", desc: "关注学生特长，实行小班化教学，因材施教。" },
    { icon: "Building2", title: "一流硬件设施", desc: "智慧教室、多功能实验室、标准化运动场一应俱全。" },
    { icon: "Heart", title: "全方位服务", desc: "星级食宿条件，专业心理咨询，保障学生身心健康。" },
  ],
  courses: [
    { title: "国学经典", category: "人文素养", img: "https://picsum.photos/seed/culture/400/500" },
    { title: "科创实验", category: "科技创新", img: "https://picsum.photos/seed/science/400/500" },
    { title: "艺术鉴赏", category: "美育教育", img: "https://picsum.photos/seed/art/400/500" },
    { title: "体育竞技", category: "身心健康", img: "https://picsum.photos/seed/sports/400/500" },
  ],
  faculty: [
    { name: "张老师", title: "特级教师", role: "数学组组长", img: "https://picsum.photos/seed/teacher1/300/400" },
    { name: "李老师", title: "高级教师", role: "语文名师", img: "https://picsum.photos/seed/teacher2/300/400" },
    { name: "王老师", title: "骨干教师", role: "英语学科带头人", img: "https://picsum.photos/seed/teacher3/300/400" },
    { name: "赵老师", title: "博士教师", role: "物理竞赛教练", img: "https://picsum.photos/seed/teacher4/300/400" },
  ],
  campus: [
    { title: "教学大楼", img: "https://picsum.photos/seed/campus1/1200/800", size: 'large' },
    { title: "图书馆", img: "https://picsum.photos/seed/campus2/600/800", size: 'small' },
    { title: "体育馆", img: "https://picsum.photos/seed/campus3/600/800", size: 'small' },
    { title: "学生公寓", img: "https://picsum.photos/seed/campus4/1200/800", size: 'large' },
  ],
  achievements: [
    { number: "98%", label: "本科升学率", icon: "GraduationCap" },
    { number: "500+", label: "竞赛奖项", icon: "Trophy" },
    { number: "100+", label: "名校录取通知", icon: "BookOpen" },
  ],
  footer: {
    intro: "漳州正兴学校是一所致力于卓越教育的现代化学校。我们以“正德兴学”为核心，为每一位学子提供最优质的成长平台。",
    copyright: `© ${new Date().getFullYear()} 漳州正兴学校. All Rights Reserved.`
  },
  contact: {
    address: "福建省漳州市芗城区正兴大道1号",
    phone: "0596-1234567",
    email: "contact@zxschool.com"
  }
};

// --- Constants ---
const NAV_ITEMS: NavItem[] = [
  { label: '学校介绍', id: 'intro' },
  { label: '办学优势', id: 'advantages' },
  { label: '特色课程', id: 'courses' },
  { label: '师资力量', id: 'faculty' },
  { label: '校园环境', id: 'campus' },
  { label: '学子成就', id: 'achievements' },
  { label: '校园新闻', id: 'news' },
];

const SCHOOL_NAME = "漳州正兴学校";
const SCHOOL_SLOGAN = "正德兴学，育才报国";
const ADMIN_EMAIL = "uldgxk@gmail.com";

// --- Components ---

const Navbar = ({ onHomeClick }: { onHomeClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    onHomeClick();
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    setIsOpen(false);
  };

  return (
    <nav className={cn(
      "fixed w-full z-50 transition-all duration-300",
      scrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={onHomeClick}>
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white font-bold text-xl">正</span>
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight",
              scrolled ? "text-gray-900" : "text-white"
            )}>
              {SCHOOL_NAME}
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors hover:text-red-500",
                    scrolled ? "text-gray-700" : "text-white/90"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <a 
                href="http://bm.zxxuexiao.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30"
              >
                在线报名
              </a>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn("p-2 rounded-md", scrolled ? "text-gray-900" : "text-white")}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 border-b border-gray-50"
                >
                  {item.label}
                </button>
              ))}
              <div className="p-4">
                <a 
                  href="http://bm.zxxuexiao.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-red-600 text-white px-5 py-3 rounded-xl text-base font-medium"
                >
                  在线报名
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const SectionHeading = ({ title, subtitle, light = false }: { title: string; subtitle?: string; light?: boolean }) => (
  <div className="text-center mb-16">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("text-3xl md:text-4xl font-bold mb-4", light ? "text-white" : "text-gray-900")}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={cn("max-w-2xl mx-auto text-lg", light ? "text-white/80" : "text-gray-600")}
      >
        {subtitle}
      </motion.p>
    )}
    <motion.div 
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="w-20 h-1 bg-red-600 mx-auto mt-6 rounded-full"
    />
  </div>
);

// --- Admin Dashboard Component ---
const UserManagement = ({ currentUser }: { currentUser: AppUser }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', displayName: '', role: 'editor' as 'admin' | 'editor' });
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser));
      setUsers(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.displayName) {
      alert('请填写完整信息');
      return;
    }

    try {
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        username: newUser.username,
        password: newUser.password,
        displayName: newUser.displayName,
        role: newUser.role,
        createdAt: Timestamp.now()
      });
      setIsAdding(false);
      setNewUser({ username: '', password: '', displayName: '', role: 'editor' });
    } catch (error) {
      console.error('Error adding user:', error);
      alert('添加失败');
    }
  };

  const handleUpdatePassword = async () => {
    if (!editingUser || !editPassword) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.uid), {
        password: editPassword
      });
      setEditingUser(null);
      setEditPassword('');
      alert('密码修改成功');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('修改失败');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === currentUser.uid) {
      alert('不能删除自己');
      return;
    }
    if (window.confirm('确定删除该用户吗？')) {
      await deleteDoc(doc(db, 'users', uid));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">用户管理</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all flex items-center"
        >
          <UserPlus size={18} className="mr-2" /> 添加用户
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="用户名" 
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
            <input 
              type="password" 
              placeholder="密码" 
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
            <input 
              type="text" 
              placeholder="显示名称" 
              value={newUser.displayName}
              onChange={e => setNewUser({...newUser, displayName: e.target.value})}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
            <select 
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as any})}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="editor">编辑 (仅管理文章)</option>
              <option value="admin">管理员 (全权限)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">取消</button>
            <button onClick={handleAddUser} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">确认添加</button>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-900">修改用户密码: {editingUser.displayName}</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="password" 
              placeholder="新密码" 
              value={editPassword}
              onChange={e => setEditPassword(e.target.value)}
              className="flex-grow px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex space-x-3">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-500 hover:text-gray-700">取消</button>
              <button onClick={handleUpdatePassword} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">确认修改</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">用户</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">角色</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">创建时间</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-bold mr-3">
                      {u.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{u.displayName}</div>
                      <div className="text-xs text-gray-400">@{u.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    u.role === 'admin' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {u.role === 'admin' ? '管理员' : '编辑'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.createdAt?.toDate().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => {
                        setEditingUser(u);
                        setEditPassword('');
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="修改密码"
                    >
                      <Lock size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.uid)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PageManagement = ({ config }: { config: SiteConfig }) => {
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'site_config', 'home'), localConfig);
      alert('页面配置已更新');
      window.location.reload(); // 刷新以应用更改
    } catch (error) {
      console.error('Error saving site config:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: keyof SiteConfig['hero'], value: string) => {
    setLocalConfig({
      ...localConfig,
      hero: { ...localConfig.hero, [field]: value }
    });
  };

  const updateIntro = (field: keyof SiteConfig['intro'], value: string) => {
    setLocalConfig({
      ...localConfig,
      intro: { ...localConfig.intro, [field]: value }
    });
  };

  const updateArrayItem = (section: 'advantages' | 'courses' | 'faculty' | 'campus' | 'achievements', index: number, field: string, value: string) => {
    const newArray = [...(localConfig[section] as any[])];
    newArray[index] = { ...newArray[index], [field]: value };
    setLocalConfig({ ...localConfig, [section]: newArray });
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24 z-30">
        <div>
          <h3 className="text-xl font-bold text-gray-900">页面内容管理</h3>
          <p className="text-sm text-gray-500">修改首页各个板块的文字、图片和图标</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center shadow-lg shadow-red-500/20 disabled:opacity-50"
        >
          <Save size={20} className="mr-2" /> {saving ? '保存中...' : '保存更改'}
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-6 flex items-center text-red-600">
          <Layout className="mr-2" size={20} /> 首屏 (Hero Section)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">主标题 (大字)</label>
            <input 
              type="text"
              value={localConfig.hero.title}
              onChange={e => updateHero('title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">副标题 (校训)</label>
            <input 
              type="text"
              value={localConfig.hero.subtitle}
              onChange={e => updateHero('subtitle', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">办学理念</label>
            <input 
              type="text"
              value={localConfig.hero.description}
              onChange={e => updateHero('description', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">背景图片 URL</label>
            <input 
              type="text"
              value={localConfig.hero.bgImage}
              onChange={e => updateHero('bgImage', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-6 flex items-center text-red-600">
          <Info className="mr-2" size={20} /> 关于我们 (Intro)
        </h4>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input 
              type="text"
              value={localConfig.intro.title}
              onChange={e => updateIntro('title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述内容</label>
            <textarea 
              value={localConfig.intro.content}
              onChange={e => updateIntro('content', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none h-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">展示图片 URL</label>
            <input 
              type="text"
              value={localConfig.intro.image}
              onChange={e => updateIntro('image', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Advantages Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-6 flex items-center text-red-600">
          <Zap className="mr-2" size={20} /> 办学优势 (Advantages)
        </h4>
        <div className="space-y-8">
          {localConfig.advantages.map((item, idx) => (
            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">标题</label>
                  <input 
                    type="text"
                    value={item.title}
                    onChange={e => updateArrayItem('advantages', idx, 'title', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">图标 (Lucide 名称)</label>
                  <input 
                    type="text"
                    value={item.icon}
                    onChange={e => updateArrayItem('advantages', idx, 'icon', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">描述</label>
                  <input 
                    type="text"
                    value={item.desc}
                    onChange={e => updateArrayItem('advantages', idx, 'desc', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-6 flex items-center text-red-600">
          <BookOpen className="mr-2" size={20} /> 特色课程 (Courses)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {localConfig.courses.map((item, idx) => (
            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">课程名称</label>
                  <input 
                    type="text"
                    value={item.title}
                    onChange={e => updateArrayItem('courses', idx, 'title', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">描述</label>
                  <textarea 
                    value={item.category}
                    onChange={e => updateArrayItem('courses', idx, 'category', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none h-20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">图片 URL</label>
                  <input 
                    type="text"
                    value={item.img}
                    onChange={e => updateArrayItem('courses', idx, 'img', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faculty Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-6 flex items-center text-red-600">
          <Users className="mr-2" size={20} /> 师资力量 (Faculty)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {localConfig.faculty.map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img src={item.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">姓名</label>
                  <input 
                    type="text"
                    value={item.name}
                    onChange={e => updateArrayItem('faculty', idx, 'name', e.target.value)}
                    className="w-full px-3 py-1 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">职位</label>
                  <input 
                    type="text"
                    value={item.role}
                    onChange={e => updateArrayItem('faculty', idx, 'role', e.target.value)}
                    className="w-full px-3 py-1 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">头像 URL</label>
                  <input 
                    type="text"
                    value={item.img}
                    onChange={e => updateArrayItem('faculty', idx, 'img', e.target.value)}
                    className="w-full px-3 py-1 rounded-lg border border-gray-200 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-6 flex items-center text-red-600">
          <Camera className="mr-2" size={20} /> 校园环境 (Campus)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {localConfig.campus.map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-3">
                <div className="aspect-video rounded-xl overflow-hidden">
                  <img src={item.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">名称</label>
                  <input 
                    type="text"
                    value={item.title}
                    onChange={e => updateArrayItem('campus', idx, 'title', e.target.value)}
                    className="w-full px-3 py-1 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">图片 URL</label>
                  <input 
                    type="text"
                    value={item.img}
                    onChange={e => updateArrayItem('campus', idx, 'img', e.target.value)}
                    className="w-full px-3 py-1 rounded-lg border border-gray-200 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-6 flex items-center text-red-600">
          <Trophy className="mr-2" size={20} /> 学子成就 (Achievements)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {localConfig.achievements.map((item, idx) => (
            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">数字 (如 98%)</label>
                  <input 
                    type="text"
                    value={item.number}
                    onChange={e => updateArrayItem('achievements', idx, 'number', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">标签</label>
                  <input 
                    type="text"
                    value={item.label}
                    onChange={e => updateArrayItem('achievements', idx, 'label', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">图标 (Lucide 名称)</label>
                  <input 
                    type="text"
                    value={item.icon}
                    onChange={e => updateArrayItem('achievements', idx, 'icon', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer & Contact Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold mb-6 flex items-center text-red-600">
          <Info className="mr-2" size={20} /> 底部信息与联系方式 (Footer & Contact)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h5 className="font-bold text-gray-900 border-b pb-2">底部介绍</h5>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">学校简介 (底部显示)</label>
              <textarea 
                rows={4}
                value={localConfig.footer.intro}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  footer: { ...localConfig.footer, intro: e.target.value }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">版权信息</label>
              <input 
                type="text"
                value={localConfig.footer.copyright}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  footer: { ...localConfig.footer, copyright: e.target.value }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-6">
            <h5 className="font-bold text-gray-900 border-b pb-2">联系方式</h5>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">学校地址</label>
              <input 
                type="text"
                value={localConfig.contact.address}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  contact: { ...localConfig.contact, address: e.target.value }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
              <input 
                type="text"
                value={localConfig.contact.phone}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  contact: { ...localConfig.contact, phone: e.target.value }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">电子邮箱</label>
              <input 
                type="text"
                value={localConfig.contact.email}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  contact: { ...localConfig.contact, email: e.target.value }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ appUser, onLogout, siteConfig }: { appUser: AppUser; onLogout: () => void; siteConfig: SiteConfig }) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'users' | 'page'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({
    title: '',
    content: '',
    summary: '',
    coverImage: '',
    category: '校园新闻',
    isPublished: false
  });

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerateArticles = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const { generateArticles } = await import('./services/articleGenerator');
      const newArticles = await generateArticles();
      
      const batch = newArticles.map((art: any) => {
        return addDoc(collection(db, 'articles'), {
          ...art,
          author: 'AI 助手',
          isPublished: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      });
      
      await Promise.all(batch);
      alert('成功生成并发布 10 篇新闻文章！');
    } catch (error) {
      console.error('Error generating articles:', error);
      alert('生成失败，请检查 API Key 配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!currentArticle.title || !currentArticle.content) {
      alert('标题和内容不能为空');
      return;
    }

    const data = {
      ...currentArticle,
      updatedAt: Timestamp.now(),
      createdAt: currentArticle.createdAt || Timestamp.now(),
      author: appUser.displayName
    };

    try {
      if (currentArticle.id) {
        await updateDoc(doc(db, 'articles', currentArticle.id), data);
      } else {
        await addDoc(collection(db, 'articles'), data);
      }
      setIsEditing(false);
      setCurrentArticle({ title: '', content: '', summary: '', coverImage: '', category: '校园新闻', isPublished: false });
    } catch (error) {
      console.error('Error saving article:', error);
      alert('保存失败，请检查权限');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await deleteDoc(doc(db, 'articles', id));
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('删除失败');
      }
    }
  };

  if (isEditing) {
    return (
      <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => setIsEditing(false)}
            className="flex items-center text-gray-600 hover:text-red-600 mb-8 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> 返回列表
          </button>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-8">{currentArticle.id ? '编辑文章' : '发布新文章'}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">文章标题</label>
                <input 
                  type="text"
                  value={currentArticle.title}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="请输入标题"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                  <select 
                    value={currentArticle.category}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 transition-all"
                  >
                    <option>校园新闻</option>
                    <option>通知公告</option>
                    <option>教学动态</option>
                    <option>学子风采</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">封面图 URL</label>
                  <input 
                    type="text"
                    value={currentArticle.coverImage}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, coverImage: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
                <textarea 
                  value={currentArticle.summary}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, summary: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 transition-all h-24"
                  placeholder="简短的文章介绍"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">正文内容 (支持 Markdown)</label>
                <textarea 
                  value={currentArticle.content}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 transition-all h-64 font-mono"
                  placeholder="# 标题\n\n正文内容..."
                />
              </div>

              <div className="flex items-center space-x-4 py-4">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={currentArticle.isPublished}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, isPublished: e.target.checked })}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-2 text-gray-700">立即发布</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  onClick={handleSave}
                  className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center"
                >
                  <Save size={20} className="mr-2" /> 保存文章
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">管理后台</h2>
            <p className="text-gray-500 mt-2">欢迎回来，{appUser.displayName} ({appUser.role === 'admin' ? '管理员' : '编辑'})</p>
          </div>
          <div className="flex space-x-4">
            {activeTab === 'articles' && (
              <>
                <button 
                  onClick={handleGenerateArticles}
                  disabled={isGenerating}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  <Sparkles size={20} className="mr-2" /> {isGenerating ? '正在生成...' : 'AI 生成 10 篇文章'}
                </button>
                <button 
                  onClick={() => {
                    setCurrentArticle({ title: '', content: '', summary: '', coverImage: '', category: '校园新闻', isPublished: false });
                    setIsEditing(true);
                  }}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center shadow-lg shadow-red-500/20"
                >
                  <Plus size={20} className="mr-2" /> 发布文章
                </button>
              </>
            )}
            <button 
              onClick={onLogout}
              className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center"
            >
              <LogOut size={20} className="mr-2" /> 退出登录
            </button>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-2xl mb-8 w-fit">
          <button 
            onClick={() => setActiveTab('articles')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'articles' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            文章管理
          </button>
          {appUser.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('users')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'users' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              用户管理
            </button>
          )}
          {appUser.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('page')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'page' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              页面管理
            </button>
          )}
        </div>

        {activeTab === 'articles' ? (
          <div className="grid grid-cols-1 gap-6">
            {articles.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                <p className="text-gray-400">暂无文章，点击上方按钮开始发布</p>
              </div>
            ) : (
              articles.map(article => (
                <div key={article.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all">
                  <div className="w-full md:w-32 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {article.coverImage ? (
                      <img src={article.coverImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen size={32} /></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">{article.category}</span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-md",
                        article.isPublished ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50"
                      )}>
                        {article.isPublished ? '已发布' : '草稿'}
                      </span>
                      <span className="text-xs text-gray-400">{article.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{article.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-1">{article.summary}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setCurrentArticle(article);
                        setIsEditing(true);
                      }}
                      className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(article.id)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
        ) : activeTab === 'users' ? (
          <UserManagement currentUser={appUser} />
        ) : (
          <PageManagement config={siteConfig} />
        )}
      </div>
    </div>
  );
};

// --- News Section Component ---
const NewsSection = ({ onArticleClick }: { onArticleClick: (article: Article) => void }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const q = query(
      collection(db, 'articles'), 
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="py-24 text-center text-gray-400">加载中...</div>;

  const displayedArticles = articles.slice(0, visibleCount);

  return (
    <section id="news" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="校园新闻" 
          subtitle="关注正兴动态，见证学校成长"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedArticles.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-400">暂无新闻动态</div>
          ) : (
            displayedArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.1 }}
                onClick={() => onArticleClick(article)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-gray-100"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={article.coverImage || `https://picsum.photos/seed/${article.id}/800/600`} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center text-gray-400 text-xs mb-4">
                    <Calendar size={14} className="mr-2" />
                    {article.createdAt?.toDate().toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6">
                    {article.summary || article.content.substring(0, 100) + '...'}
                  </p>
                  <div className="flex items-center text-red-600 font-bold text-sm">
                    阅读更多 <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {visibleCount < articles.length && (
          <div className="mt-16 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="px-12 py-4 bg-white text-red-600 border-2 border-red-600 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/10"
            >
              加载更多校园新闻
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// --- Article Detail Component ---
const ArticleDetail = ({ article, onBack }: { article: Article; onBack: () => void }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-24 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-red-600 mb-12 transition-colors group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 返回新闻列表
        </button>

        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">{article.category}</span>
            <span className="text-gray-400 text-sm">{article.createdAt?.toDate().toLocaleDateString()}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">{article.title}</h1>
          {article.coverImage && (
            <div className="rounded-3xl overflow-hidden shadow-2xl mb-12">
              <img src={article.coverImage} alt="" className="w-full h-auto" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>

        <div className="prose prose-lg prose-red max-w-none">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState<'home' | 'admin' | 'article'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check local storage for session
      const savedUser = localStorage.getItem('zx_admin_session');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Verify user still exists in DB
          const userDoc = await getDoc(doc(db, 'users', userData.uid));
          if (userDoc.exists()) {
            setAppUser({ uid: userDoc.id, ...userDoc.data() } as AppUser);
          } else {
            localStorage.removeItem('zx_admin_session');
          }
        } catch (e) {
          localStorage.removeItem('zx_admin_session');
        }
      }

      // 2. Fetch Site Config
      try {
        const configDoc = await getDoc(doc(db, 'site_config', 'home'));
        if (configDoc.exists()) {
          setSiteConfig(configDoc.data() as SiteConfig);
        } else {
          // Initialize default config if not exists
          await setDoc(doc(db, 'site_config', 'home'), DEFAULT_CONFIG);
        }
      } catch (error) {
        console.error('Config fetch error:', error);
      }

      // 3. Bootstrap default admin if no users exist
      try {
        const userSnapshot = await getDocs(query(collection(db, 'users'), limit(1)));
        if (userSnapshot.empty) {
          console.log('Initializing default admin account...');
          const adminRef = doc(collection(db, 'users'));
          const defaultAdmin = {
            username: 'admin',
            password: 'admin',
            displayName: '系统管理员',
            role: 'admin',
            createdAt: Timestamp.now()
          };
          await setDoc(adminRef, defaultAdmin);
        }
      } catch (error) {
        console.error('Bootstrap error:', error);
      }

      setLoading(false);
    };

    initAuth();

    // Hidden admin route check
    const path = window.location.pathname;
    if (path === '/guanli' || path === '/guanli.php') {
      setView('admin');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) return;
    
    setLoginLoading(true);
    try {
      // Custom login: Query Firestore for matching username and password
      const q = query(
        collection(db, 'users'), 
        where('username', '==', loginForm.username),
        where('password', '==', loginForm.password),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = { uid: userDoc.id, ...userDoc.data() } as AppUser;
        setAppUser(userData);
        localStorage.setItem('zx_admin_session', JSON.stringify(userData));
      } else {
        alert('用户名或密码错误');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('登录失败: ' + (error.message || '系统错误'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAppUser(null);
    localStorage.removeItem('zx_admin_session');
    setView('home');
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-red-600 font-bold">正兴学校官网加载中...</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-red-100 selection:text-red-600">
      <Navbar 
        onHomeClick={() => setView('home')} 
      />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
              <div className="absolute inset-0 z-0">
                <motion.div 
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 2 }}
                  className="w-full h-full"
                >
                  <img 
                    src={siteConfig.hero.bgImage} 
                    alt="Campus" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay" />
              </div>
              
              <div className="relative z-10 text-center px-4 w-full">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="max-w-7xl mx-auto"
                >
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 100 }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-px bg-red-500 mb-8"
                    />
                    
                    <h1 className="relative">
                      <motion.span
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="block text-5xl md:text-[8vw] font-black text-white leading-none tracking-tighter uppercase italic"
                        style={{ textShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                      >
                        {siteConfig.hero.title}
                      </motion.span>
                    </h1>

                    {/* 办学理念 - Philosophy */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="mt-6 flex items-center justify-center space-x-4"
                    >
                      <div className="h-[1px] w-8 bg-red-500" />
                      <span className="text-white/80 text-lg md:text-xl font-medium tracking-[0.3em] uppercase">
                        {siteConfig.hero.description}
                      </span>
                      <div className="h-[1px] w-8 bg-red-500" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      className="mt-12 flex flex-col items-center"
                    >
                      <p className="text-xl md:text-3xl text-white/60 font-light tracking-[0.5em] mb-12 uppercase">
                        {siteConfig.hero.subtitle}
                      </p>
                      
                      <div className="flex flex-wrap gap-6 justify-center">
                        <button 
                          onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}
                          className="px-10 py-5 bg-red-600 text-white rounded-full text-lg font-bold hover:bg-red-700 transition-all shadow-2xl hover:shadow-red-600/50 flex items-center group overflow-hidden relative"
                        >
                          <span className="relative z-10 flex items-center">
                            探索正兴 <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <motion.div 
                            className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                          />
                        </button>
                        <button className="px-10 py-5 bg-white/5 backdrop-blur-xl text-white border border-white/20 rounded-full text-lg font-bold hover:bg-white/10 transition-all">
                          在线咨询
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <div className="absolute left-10 bottom-10 hidden lg:block">
                <div className="flex flex-col space-y-4">
                  <div className="w-px h-20 bg-white/20" />
                  <span className="text-white/30 text-[10px] uppercase tracking-[0.5em] vertical-text rotate-180" style={{ writingMode: 'vertical-rl' }}>
                    ESTABLISHED 2004
                  </span>
                </div>
              </div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
              >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                  <motion.div 
                    animate={{ y: [0, 12, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-1 h-2 bg-red-500 rounded-full" 
                  />
                </div>
              </motion.div>
            </section>

            {/* 学校介绍 - Intro */}
            <section id="intro" className="py-24 bg-white overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                      {siteConfig.intro.tag}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                      {siteConfig.intro.title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                      {siteConfig.intro.content}
                    </p>
                    <div className="flex items-center space-x-8">
                      <div>
                        <span className="block text-4xl font-bold text-red-600">{siteConfig.intro.years}</span>
                        <span className="text-sm text-gray-500 uppercase tracking-wider">办学经验</span>
                      </div>
                      <div className="w-px h-12 bg-gray-200" />
                      <button className="text-gray-900 font-bold flex items-center group">
                        查看详细介绍 <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                      <img 
                        src={siteConfig.intro.image} 
                        alt="School Building" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-8 -left-8 bg-red-600 text-white p-8 rounded-2xl shadow-xl hidden md:block">
                      <Quote className="w-8 h-8 mb-4 opacity-50" />
                      <p className="text-xl font-serif italic">教育是点燃火焰，<br />而非灌满容器。</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* 校园新闻 - News */}
            <NewsSection onArticleClick={(article) => {
              setSelectedArticle(article);
              setView('article');
            }} />

            {/* 办学优势 - Advantages */}
            <section id="advantages" className="py-24 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading 
                  title="办学优势" 
                  subtitle="我们致力于提供最优质的教育资源，助力学子全面发展"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {siteConfig.advantages.map((adv, index) => {
                    const IconComponent = (LucideIcons as any)[adv.icon] || LucideIcons.Star;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                      >
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-600 transition-colors">
                          <IconComponent className="w-8 h-8 text-red-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{adv.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{adv.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 特色课程 - Courses */}
            <section id="courses" className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading 
                  title="特色课程" 
                  subtitle="打破传统教学边界，构建多元化课程体系"
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {siteConfig.courses.map((course, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group h-[400px] rounded-3xl overflow-hidden cursor-pointer"
                    >
                      <img 
                        src={course.img} 
                        alt={course.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8">
                        <span className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2 block">{course.category}</span>
                        <h3 className="text-2xl font-bold text-white">{course.title}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* 师资力量 - Faculty */}
            <section id="faculty" className="py-24 bg-gray-900 text-white overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading 
                  title="师资力量" 
                  subtitle="名师荟萃，匠心育人。我们的教师团队由省市级骨干教师和名校硕士组成。"
                  light
                />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {siteConfig.faculty.map((teacher, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6">
                        <img 
                          src={teacher.img} 
                          alt={teacher.name} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{teacher.name}</h3>
                      <p className="text-red-500 text-sm font-medium mb-2">{teacher.title}</p>
                      <p className="text-white/60 text-sm">{teacher.role}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* 校园环境 - Campus */}
            <section id="campus" className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading 
                  title="校园环境" 
                  subtitle="优美的校园环境，先进的教学设施，为学子提供最佳的学习生活空间"
                />
                
                <div className="grid grid-cols-12 gap-4 h-[600px]">
                  {siteConfig.campus.map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className={clsx(
                        "rounded-3xl overflow-hidden relative group",
                        item.size === 'large' ? "col-span-12 md:col-span-8" : "col-span-6 md:col-span-4"
                      )}
                    >
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white font-bold text-xl">{item.title}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* 学子成就 - Achievements */}
            <section id="achievements" className="py-24 bg-red-600 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading 
                  title="学子成就" 
                  subtitle="见证每一份努力，分享每一份喜悦。正兴学子遍布全球名校。"
                  light
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {siteConfig.achievements.map((stat, index) => {
                    const IconComponent = (LucideIcons as any)[stat.icon] || LucideIcons.Star;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                          <IconComponent size={36} />
                        </div>
                        <div className="text-5xl font-black mb-2">{stat.number}</div>
                        <div className="text-white/70 text-lg font-medium uppercase tracking-widest">{stat.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {appUser ? (
              <AdminDashboard appUser={appUser} onLogout={handleLogout} siteConfig={siteConfig} />
            ) : (
              <div className="h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border border-gray-100">
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Lock size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">管理员登录</h2>
                  <p className="text-gray-500 mb-8">请输入您的账号和密码以进入管理后台</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">用户名</label>
                      <input 
                        type="text" 
                        required
                        value={loginForm.username}
                        onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                        className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all outline-none"
                        placeholder="admin"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">密码</label>
                      <input 
                        type="password" 
                        required
                        value={loginForm.password}
                        onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                        className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center disabled:opacity-50"
                    >
                      {loginLoading ? '登录中...' : '立即登录'}
                    </button>
                  </form>

                  <button 
                    onClick={() => setView('home')}
                    className="w-full mt-6 text-gray-400 hover:text-red-600 transition-colors text-sm font-medium"
                  >
                    返回首页
                  </button>

                  <div className="mt-8 pt-6 border-t border-gray-50">
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest">
                      本地化管理系统已启用
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {view === 'article' && selectedArticle && (
          <motion.div
            key="article"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ArticleDetail 
              article={selectedArticle} 
              onBack={() => setView('home')} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">正</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">{SCHOOL_NAME}</span>
              </div>
              <p className="text-white/50 max-w-md mb-8 leading-relaxed">
                {siteConfig.footer.intro}
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                  <Globe size={18} />
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                  <Phone size={18} />
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                  <Mail size={18} />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">快速链接</h4>
              <ul className="grid grid-cols-2 gap-4 text-white/50">
                {NAV_ITEMS.map(item => (
                  <li key={item.id}>
                    <button onClick={() => {
                      setView('home');
                      setTimeout(() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }} className="hover:text-red-500 transition-colors text-left">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">联系我们</h4>
              <ul className="space-y-4 text-white/50">
                <li className="flex items-start">
                  <MapPin size={18} className="mr-3 text-red-600 shrink-0 mt-1" />
                  <span>{siteConfig.contact.address}</span>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-3 text-red-600 shrink-0" />
                  <span>{siteConfig.contact.phone}</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="mr-3 text-red-600 shrink-0" />
                  <span>{siteConfig.contact.email}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 text-center text-white/30 text-sm">
            <p>{siteConfig.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
