import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import confetti from 'canvas-confetti';
import { Student } from '../../../types';
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Users,
  CheckCircle2,
  Palette,
} from 'lucide-react';

export interface UfoCallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  onApplyBonusScore?: (studentId: string, pts: number, reason: string) => void;
}

const PRESET_BACKGROUNDS = [
  { id: 'sky', label: 'Bầu trời xanh', color: '#87CEEB', url: '' },
  { id: 'galaxy', label: 'Vũ trụ Galaxy', color: '#090a1a', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80' },
  { id: 'cyber', label: 'Không gian Cyber', color: '#0f172a', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80' },
];

export const UfoCallerModal: React.FC<UfoCallerModalProps> = ({
  isOpen,
  onClose,
  students = [],
  className,
}) => {
  // Lấy trực tiếp danh sách học sinh theo sĩ số lớp dạy (ưu tiên học sinh có mặt/đi muộn nếu có điểm danh)
  const classStudentNames = useMemo(() => {
    const present = students.filter((s) => s.attendance !== 'absent');
    const targetPool = present.length > 0 ? present : students;
    return targetPool.map((s) => s.name.trim()).filter((n) => n.length > 0);
  }, [students]);

  const [allStudents, setAllStudents] = useState<string[]>([]);
  const [calledNames, setCalledNames] = useState<string[]>([]);
  const calledNamesRef = useRef<Set<string>>(new Set());

  const [allowRepeat, setAllowRepeat] = useState<boolean>(false);
  const [showBgMenu, setShowBgMenu] = useState<boolean>(false);

  // Background & Sound state
  const [bgImage, setBgImage] = useState<string>('');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // In-Game calling states
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [calledStudentName, setCalledStudentName] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Three.js Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const ufosRef = useRef<THREE.Group[]>([]);
  const selectedUfoRef = useRef<THREE.Group | null>(null);
  const lastCallTimeRef = useRef<number>(0);

  // Đồng bộ danh sách học sinh theo sĩ số lớp khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    setAllStudents(classStudentNames);
  }, [isOpen, classStudentNames]);

  // Danh sách học sinh chưa gọi (Chống trùng lặp tuyệt đối)
  const availableStudents = useMemo(() => {
    if (allowRepeat) return allStudents;
    return allStudents.filter((name) => !calledNames.includes(name));
  }, [allStudents, calledNames, allowRepeat]);

  // Show Toast notification
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Web Audio Synthesizer (call, drop, tada, fly)
  const playSound = useCallback((type: 'call' | 'drop' | 'tada' | 'fly') => {
    if (soundMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'call') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(450, now);
        oscillator.frequency.exponentialRampToValueAtTime(950, now + 0.35);
        gainNode.gain.setValueAtTime(0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        oscillator.start();
        oscillator.stop(now + 0.35);
      } else if (type === 'drop') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(900, now);
        oscillator.frequency.linearRampToValueAtTime(350, now + 0.2);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start();
        oscillator.stop(now + 0.2);
      } else if (type === 'tada') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(523.25, now);
        oscillator.frequency.setValueAtTime(659.25, now + 0.08);
        oscillator.frequency.setValueAtTime(783.99, now + 0.16);
        oscillator.frequency.setValueAtTime(1046.50, now + 0.24);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        oscillator.start();
        oscillator.stop(now + 0.8);
      } else if (type === 'fly') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.linearRampToValueAtTime(1600, now + 0.4);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start();
        oscillator.stop(now + 0.4);
      }
    } catch {
      // AudioContext fallback
    }
  }, [soundMuted]);

  // Handle custom background image upload
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgImage(url);
    showToast('Đã cập nhật phông nền mới!', 'success');
  };

  // Create single 3D UFO Group
  const createSingleUFO = useCallback((index: number) => {
    const group = new THREE.Group();
    const colors = [0xff5722, 0xffeb3b, 0x4caf50, 0x2196f3, 0x9c27b0, 0xe91e63, 0x00bcd4, 0xff9800];
    const randomColor = colors[index % colors.length];

    // 1. UFO Base Hull
    const baseGeo = new THREE.SphereGeometry(2, 32, 16);
    baseGeo.scale(1, 0.25, 1);
    const baseMat = new THREE.MeshPhongMaterial({ color: randomColor, shininess: 100 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.castShadow = true;
    group.add(base);

    // 2. Glass Cockpit Dome
    const domeGeo = new THREE.SphereGeometry(1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.65,
      shininess: 200,
      side: THREE.DoubleSide,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.1;
    group.add(dome);

    // 3. Cute Alien Head
    const alienGroup = new THREE.Group();
    const alienGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const alienMat = new THREE.MeshPhongMaterial({ color: 0x8bc34a });
    const alien = new THREE.Mesh(alienGeo, alienMat);
    alienGroup.add(alien);

    // Alien Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.2, 0.15, 0.4);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.2, 0.15, 0.4);
    alienGroup.add(eyeL, eyeR);
    alienGroup.position.y = 0.4;
    group.add(alienGroup);

    // 4. White Glowing Edge Torus Ring
    const ringGeo = new THREE.TorusGeometry(2.05, 0.1, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Physics & Orbit Metadata
    group.userData = {
      baseX: (Math.random() - 0.5) * 60,
      baseY: (Math.random() - 0.5) * 20 + 10,
      baseZ: (Math.random() - 0.5) * 30 - 10,
      hoverSpeed: Math.random() * 0.002 + 0.001,
      hoverOffset: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      isActive: true,
      currentBanner: null as THREE.Group | null,
      orbitRadiusX: Math.random() * 15 + 5,
      orbitRadiusY: Math.random() * 8 + 3,
      orbitRadiusZ: Math.random() * 10 + 5,
      orbitSpeedX: (Math.random() * 0.0008 + 0.0004) * (Math.random() > 0.5 ? 1 : -1),
      orbitSpeedY: (Math.random() * 0.0008 + 0.0004) * (Math.random() > 0.5 ? 1 : -1),
      orbitSpeedZ: (Math.random() * 0.0008 + 0.0004) * (Math.random() > 0.5 ? 1 : -1),
    };

    group.position.set(group.userData.baseX, group.userData.baseY, group.userData.baseZ);
    return group;
  }, []);

  // Create High-Res Banner Texture
  const createBannerTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Red gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#e11d48');
    grad.addColorStop(0.5, '#f43f5e');
    grad.addColorStop(1, '#be123c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer gold border
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 14;
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

    // Inner white border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

    // Student name text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 96px "Baloo 2", "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 6);

    const texture = new THREE.CanvasTexture(canvas);
    if (rendererRef.current) {
      texture.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
    }
    return texture;
  };

  // Drop 3D Banner with Fast Snappy Bounce (350ms)
  const drop3DBanner = (ufo: THREE.Group, name: string, callback?: () => void) => {
    const texture = createBannerTexture(name);
    const geo = new THREE.PlaneGeometry(10, 2.5);
    const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
    const banner = new THREE.Mesh(geo, mat);

    const pivot = new THREE.Group();
    pivot.position.y = -0.3;
    banner.position.y = -1.25;
    pivot.add(banner);
    pivot.scale.y = 0.001;

    ufo.add(pivot);
    ufo.userData.currentBanner = pivot;

    playSound('drop');
    new TWEEN.Tween(pivot.scale)
      .to({ y: 1 }, 350)
      .easing(TWEEN.Easing.Back.Out)
      .onComplete(() => {
        if (callback) callback();
      })
      .start();
  };

  // Populate UFOs in Scene
  const populateUFOs = useCallback((count: number) => {
    const scene = sceneRef.current;
    if (!scene) return;

    ufosRef.current.forEach((ufo) => scene.remove(ufo));
    ufosRef.current = [];

    const visualCount = Math.min(Math.max(count, 8), 35);
    for (let i = 0; i < visualCount; i++) {
      const ufo = createSingleUFO(i);
      scene.add(ufo);
      ufosRef.current.push(ufo);
    }
  }, [createSingleUFO]);

  // Setup Three.js Scene Lifecycle
  useEffect(() => {
    if (!isOpen) return;

    const container = canvasContainerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 5, 25);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 4. Initial UFOs
    populateUFOs(allStudents.length || 15);

    // 5. Animation Loop
    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      TWEEN.update(time);

      const t = Date.now();
      ufosRef.current.forEach((ufo) => {
        if (ufo.userData.isActive) {
          const ud = ufo.userData;
          ufo.position.x = ud.baseX + Math.sin(t * ud.orbitSpeedX + ud.hoverOffset) * ud.orbitRadiusX;
          ufo.position.y = ud.baseY + Math.sin(t * ud.orbitSpeedY + ud.hoverOffset) * ud.orbitRadiusY;
          ufo.position.z = ud.baseZ + Math.cos(t * ud.orbitSpeedZ + ud.hoverOffset) * ud.orbitRadiusZ;

          ufo.rotation.y += ud.rotSpeed;
          ufo.rotation.z = Math.sin(t * ud.hoverSpeed * 0.5 + ud.hoverOffset) * 0.15;
          ufo.rotation.x = Math.cos(t * ud.hoverSpeed * 0.5 + ud.hoverOffset) * 0.15;
        }
      });

      renderer.render(scene, camera);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    // 6. Responsive Resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isOpen, allStudents.length, populateUFOs]);

  // Main Call Student Logic (ULTRA-FAST & 100% NON-REPEAT)
  const handleCallStudent = useCallback(() => {
    const now = Date.now();
    if (now - lastCallTimeRef.current < 260) return; // Chống spam phím nhanh dưới 0.26s
    lastCallTimeRef.current = now;

    // Strict non-repeat check from synchronous Ref
    const candidatePool = allowRepeat
      ? allStudents
      : allStudents.filter((name) => !calledNamesRef.current.has(name));

    if (candidatePool.length === 0) {
      showToast('Đã gọi hết tất cả học sinh! Nhấn "Khôi phục DS" để chơi lượt mới.', 'error');
      return;
    }

    setIsCalling(true);
    // Ẩn tên học sinh cũ ngay khi bấm Gọi tiếp (giống vòng quay may mắn)
    setCalledStudentName('');

    // 1. Pick next student randomly from uncalled candidates
    const rIndex = Math.floor(Math.random() * candidatePool.length);
    const selectedName = candidatePool[rIndex];

    // Immediately record to called set to eliminate ANY chance of repeat
    if (!allowRepeat) {
      calledNamesRef.current.add(selectedName);
      setCalledNames(Array.from(calledNamesRef.current));
    }

    const startNextCall = () => {
      playSound('call');

      const scene = sceneRef.current;
      const activeUFOs = ufosRef.current.filter((u) => u.userData.isActive);
      let targetUFO: THREE.Group;

      if (activeUFOs.length === 0) {
        targetUFO = createSingleUFO(Math.floor(Math.random() * 10));
        scene?.add(targetUFO);
        ufosRef.current.push(targetUFO);
      } else {
        targetUFO = activeUFOs[Math.floor(Math.random() * activeUFOs.length)];
      }

      selectedUfoRef.current = targetUFO;
      targetUFO.userData.isActive = false;

      const targetPos = { x: 0, y: 7, z: 12 };
      const currentRotY = targetUFO.rotation.y;
      const targetRotY = Math.ceil(currentRotY / (Math.PI * 2)) * (Math.PI * 2) + Math.PI * 4;

      // FAST SWOOP: 500ms
      new TWEEN.Tween(targetUFO.rotation)
        .to({ y: targetRotY, x: 0, z: 0 }, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      new TWEEN.Tween(targetUFO.position)
        .to(targetPos, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          // FAST BANNER DROP: 320ms
          drop3DBanner(targetUFO, selectedName, () => {
            playSound('tada');
            // UFO đã đáp xuống đất -> CHỈ XUẤT HIỆN TÊN HỌC SINH (giống vòng quay may mắn)
            setCalledStudentName(selectedName);
            confetti({
              particleCount: 160,
              spread: 95,
              origin: { y: 0.75 },
              colors: ['#ff1744', '#ffea00', '#00e676', '#2979ff', '#d500f9', '#00e5ff'],
              zIndex: 9999,
            });
            setIsCalling(false);
          });
        })
        .start();
    };

    // Fast dismiss of previous UFO in parallel (instant exit)
    const curUFO = selectedUfoRef.current;
    if (curUFO) {
      if (curUFO.userData.currentBanner) {
        curUFO.remove(curUFO.userData.currentBanner);
        curUFO.userData.currentBanner = null;
      }

      if (!allowRepeat) {
        new TWEEN.Tween(curUFO.position)
          .to({ y: 50, x: (Math.random() - 0.5) * 30, z: -50 }, 350)
          .easing(TWEEN.Easing.Back.In)
          .onComplete(() => {
            sceneRef.current?.remove(curUFO);
            ufosRef.current = ufosRef.current.filter((u) => u !== curUFO);
          })
          .start();
      } else {
        curUFO.userData.isActive = true;
      }
      startNextCall();
    } else {
      startNextCall();
    }
  }, [allStudents, allowRepeat, playSound, showToast, createSingleUFO]);

  // Keyboard shortcuts (Space & Enter) and Mouse shortcuts (Right-click & Middle-click)
  // to call "Bạn tiếp theo" continuously (STRICTLY DEDICATED TO CALLING STUDENTS ONLY)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isCallKey =
        e.code === 'Space' ||
        e.key === ' ' ||
        e.code === 'Enter' ||
        e.key === 'Enter' ||
        e.code === 'NumpadEnter';

      if (isCallKey) {
        // Prevent default scrolling, form submit or button clicking
        e.preventDefault();
        e.stopPropagation();

        // STRICT: Dedicated to calling students only.
        // Blur any focused element (buttons, links) so Space/Enter never triggers other buttons
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        handleCallStudent();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    // Right-click: trigger "Bạn tiếp theo" and block browser context menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('#bg-menu-container')) return;

      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      handleCallStudent();
    };

    // Middle-click (scroll wheel click, e.button === 1): trigger "Bạn tiếp theo" and block autoscroll
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        handleCallStudent();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('mousedown', handleMouseDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [isOpen, handleCallStudent, onClose]);

  // Reset list and clear called history
  const handleResetList = () => {
    calledNamesRef.current.clear();
    setCalledNames([]);
    setCalledStudentName('');
    populateUFOs(allStudents.length);
    showToast('Đã khôi phục toàn bộ danh sách học sinh!', 'success');

    if (selectedUfoRef.current && sceneRef.current) {
      sceneRef.current.remove(selectedUfoRef.current);
      ufosRef.current = ufosRef.current.filter((u) => u !== selectedUfoRef.current);
      selectedUfoRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black select-none font-sans">
      {/* 3D Canvas Background Container */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 z-0 bg-[#87CEEB] transition-all duration-700"
        style={{
          backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
          backgroundSize: '100% 100%',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Top Header Controls (Always accessible) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {/* Nút đổi phông nền nhanh (nhỏ gọn, không làm gián đoạn game) */}
        <div id="bg-menu-container" className="relative">
          <button
            type="button"
            onClick={() => setShowBgMenu(!showBgMenu)}
            className="p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 px-3.5"
            title="Đổi phông nền không gian"
          >
            <Palette size={18} className="text-emerald-600" />
            <span className="text-xs font-black hidden md:inline">Phông nền</span>
          </button>

          {showBgMenu && (
            <div className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-scaleUp">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-extrabold text-slate-800">Chọn phông nền</span>
                <button
                  type="button"
                  onClick={() => setShowBgMenu(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5 mb-2.5">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => {
                      setBgImage(bg.url);
                      setShowBgMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      bgImage === bg.url
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Hoặc tải ảnh từ máy tính:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleBgUpload(e);
                  setShowBgMenu(false);
                }}
                className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer bg-slate-50 rounded-full p-1 border border-slate-200"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSoundMuted(!soundMuted)}
          className="p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-lg backdrop-blur-md transition-all active:scale-95"
          title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {soundMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/85 hover:bg-rose-500 hover:text-white text-slate-800 shadow-lg backdrop-blur-md transition-all active:scale-95"
          title="Đóng trò chơi UFO (Esc)"
        >
          <X size={19} />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[70] animate-bounce pointer-events-none">
          <div
            className={`px-5 py-2.5 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-2 text-white ${
              toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            <span>{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* MAIN IN-GAME UI LAYER (DIRECT ENTRY - NO INTERMEDIATE SETUP SCREEN) */}
      <div className="absolute inset-0 z-20 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
        {/* Top In-Game Bar */}
        <div className="flex items-start justify-between">
          {/* Left Control Card: Class Info & Call Stats */}
          <div className="pointer-events-auto bg-white/95 p-4 rounded-2xl shadow-2xl backdrop-blur-md border-2 border-blue-200 w-auto min-w-[210px]">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200">
              <Users size={16} className="text-blue-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-slate-900 block truncate max-w-[170px]">
                  {className || 'Lớp học'}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Sĩ số lớp: <strong className="text-blue-600">{allStudents.length}</strong> em
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold text-slate-600">Còn lại:</span>
              <span className="text-2xl font-black text-blue-600">{availableStudents.length}</span>
              <span className="text-xs text-slate-400">/ {allStudents.length}</span>
            </div>

            <div className="text-[11px] font-extrabold text-emerald-600 mb-2.5 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Đã gọi: {calledNames.length} em (Không trùng)</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleResetList}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-3 py-1.5 rounded-xl transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5 shadow-xs"
                title="Khôi phục để tất cả học sinh đều được gọi lại"
              >
                <RotateCcw size={13} />
                <span>Khôi phục DS ({calledNames.length} đã gọi)</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                <input
                  type="checkbox"
                  checked={allowRepeat}
                  onChange={(e) => setAllowRepeat(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 font-extrabold">
                  Cho phép gọi lặp lại
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* SPOTLIGHT HUD CARD: CHỈ HIỆN DUY NHẤT TÊN HỌC SINH ĐƯỢC GỌI (GIỐNG VÒNG QUAY MAY MẮN) */}
        {calledStudentName && (
          <div className="pointer-events-auto self-center flex flex-col items-center animate-scaleUp">
            {/* Giant Name Ribbon Banner Card */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-1.5 rounded-3xl shadow-[0_12px_45px_rgba(225,29,72,0.75)] border-4 border-yellow-300">
              <div className="bg-slate-950/90 backdrop-blur-md px-10 md:px-20 py-4 md:py-6 rounded-[22px] flex items-center justify-center text-center">
                <span className="text-3xl md:text-6xl font-black text-white tracking-wide drop-shadow-[0_4px_24px_rgba(255,255,255,0.95)]">
                  {calledStudentName}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Big Calling Button */}
        <div className="pointer-events-auto self-center mb-6">
          <button
            type="button"
            onClick={handleCallStudent}
            className="bg-gradient-to-b from-emerald-400 to-emerald-600 text-white text-3xl md:text-5xl font-black py-4 md:py-5 px-12 md:px-20 rounded-full shadow-[0_12px_30px_rgba(16,185,129,0.55)] border-4 border-white transition-all select-none hover:scale-105 hover:shadow-[0_18px_40px_rgba(16,185,129,0.7)] active:scale-95 animate-pulse"
          >
            {calledStudentName || calledNames.length > 0 ? '🛸 GỌI TIẾP' : '🛸 GỌI TÊN'}
          </button>
          <p className="text-center text-white/95 text-[11px] font-bold mt-2.5 drop-shadow-md flex items-center justify-center gap-1.5 flex-wrap">
            <span>(Gọi tiếp:</span>
            <kbd className="px-1.5 py-0.5 bg-black/50 rounded border border-white/60 text-[10px]">Space</kbd>
            <span>/</span>
            <kbd className="px-1.5 py-0.5 bg-black/50 rounded border border-white/60 text-[10px]">Enter</kbd>
            <span>/</span>
            <span className="font-extrabold text-amber-300">Chuột phải</span>
            <span>/</span>
            <span className="font-extrabold text-cyan-300">Chuột giữa</span>
            <span>)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
