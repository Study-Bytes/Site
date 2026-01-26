import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Container,
    Rating,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Slider,
} from "@mui/material";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import { useAuth } from "../auth/AuthContext";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

type Course = {
    id: string;
    title: string;
    description: string;
    price: number;
    rating: number;
    difficulty: Difficulty;
    image: string;
};

const courses: Course[] = [
    {
        id: "java-core",
        title: "Java Core",
        description: "Синтаксис, ООП, коллекции, исключения — база, чтобы писать уверенно.",
        price: 1490,
        rating: 4.7,
        difficulty: "Beginner",
        image: "/course-java.jpg",
    },
    {
        id: "sql-basics",
        title: "SQL & Базы данных",
        description: "SELECT / JOIN / индексы. Понимание как хранится и ищется data.",
        price: 1990,
        rating: 4.8,
        difficulty: "Intermediate",
        image: "/course-sql.jpg",
    },
    {
        id: "networks",
        title: "Computer Networks",
        description: "TCP/UDP, VLAN, NAT, маршрутизация — на пальцах и по делу.",
        price: 1790,
        rating: 4.6,
        difficulty: "Intermediate",
        image: "/course-net.jpg",
    },
    {
        id: "react-ui",
        title: "React UI Практика",
        description: "Компоненты, состояние, роутинг, формы. Делай UI быстро и чисто.",
        price: 1590,
        rating: 4.5,
        difficulty: "Beginner",
        image: "/course-react.jpg",
    },
    {
        id: "algo",
        title: "Алгоритмы для собеседований",
        description: "Два указателя, хеши, деревья, графы — чтобы не теряться на задачах.",
        price: 2490,
        rating: 4.9,
        difficulty: "Advanced",
        image: "/course-algo.jpg",
    },
];

function difficultyColor(diff: Difficulty): "success" | "warning" | "error" {
    if (diff === "Beginner") return "success";
    if (diff === "Intermediate") return "warning";
    return "error";
}

function FeatureCard(props: { icon: ReactNode; title: string; text: string }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 1,
                border: "1px solid rgba(16,24,40,0.10)",
                backgroundColor: "rgba(255,255,255,0.74)",
                backdropFilter: "blur(10px)",
            }}
        >
            <Stack direction="row" spacing={1.2} alignItems="center">
                {props.icon}
                <Typography sx={{ fontWeight: 900 }}>{props.title}</Typography>
            </Stack>

            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.8 }}>
                {props.text}
            </Typography>
        </Box>
    );
}

export default function Home() {
    const auth = useAuth();

    // ===== Sticky CTA logic =====
    const ctaRef = useRef<HTMLDivElement | null>(null);
    const coursesRef = useRef<HTMLDivElement | null>(null);

    const [isCtaVisible, setIsCtaVisible] = useState(false);
    const [isCoursesVisible, setIsCoursesVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.target === ctaRef.current) setIsCtaVisible(e.isIntersecting);
                    if (e.target === coursesRef.current) setIsCoursesVisible(e.isIntersecting);
                }
            },
            { threshold: 0.15 }
        );

        if (ctaRef.current) obs.observe(ctaRef.current);
        if (coursesRef.current) obs.observe(coursesRef.current);

        return () => obs.disconnect();
    }, []);

    // показываем mobile-CTA, только когда обычной CTA не видно и секция курсов ещё не началась
    const showStickyMobileCTA = !isCtaVisible && !isCoursesVisible;

    const scrollToCourses = () => {
        document.getElementById("courses")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    // ===== Filters =====
    type SortKey = "rating" | "priceAsc" | "priceDesc";

    const [query, setQuery] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
    const [sort, setSort] = useState<SortKey>("rating");

    const prices = useMemo(() => courses.map((c) => c.price), []);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const [priceRange, setPriceRange] = useState<number[]>([minPrice, maxPrice]);

    const filteredCourses = useMemo(() => {
        const q = query.trim().toLowerCase();

        let list = courses.filter((c) => {
            if (!q) return true;
            return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
        });

        if (difficulty !== "All") {
            list = list.filter((c) => c.difficulty === difficulty);
        }

        list = list.filter((c) => c.price >= priceRange[0] && c.price <= priceRange[1]);

        if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
        if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
        if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);

        return list;
    }, [query, difficulty, priceRange, sort]);

    return (
        <Box sx={{ bgcolor: "background.default" }}>
            {/* HERO */}
            <Box
                component="section"
                sx={{
                    position: "relative",
                    minHeight: { xs: "100svh", md: "100vh" },
                    overflow: "hidden",
                    pt: { xs: 10, md: 12 },
                    pb: { xs: 14, md: 8 }, // запас, чтобы мобильная CTA не перекрывала низ
                }}
            >
                {/* Background layers */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 0,
                        pointerEvents: "none",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "radial-gradient(900px 450px at 20% 10%, rgba(91,95,199,0.22), transparent 60%), radial-gradient(800px 420px at 80% 20%, rgba(0,163,255,0.18), transparent 55%)",
                        }}
                    />

                    <Box
                        sx={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: { xs: -90, md: -140 },
                            height: { xs: "62vh", md: "68vh" },
                            backgroundImage: "url(/hero-study.jpg)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(0.8px)",
                            opacity: 0.88,
                            transform: "scale(1.06)",
                            maskImage:
                                "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)",
                            WebkitMaskImage:
                                "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)",
                        }}
                    />

                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "linear-gradient(180deg, rgba(246,247,251,0.68) 0%, rgba(246,247,251,0.46) 55%, rgba(246,247,251,0.74) 100%)",
                        }}
                    />
                </Box>

                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                    {auth.user && (
                        <Box
                            sx={{
                                mt: 1,
                                px: 1.5,
                                py: 1,
                                borderRadius: 2,
                                border: "1px solid rgba(16,24,40,0.10)",
                                backgroundColor: "rgba(255,255,255,0.75)",
                                backdropFilter: "blur(10px)",
                                width: "fit-content",
                            }}
                        >
                            <Typography variant="body2">
                                ✅ Вы вошли как <b>{auth.user.username}</b>
                            </Typography>
                        </Box>
                    )}

                    <Stack
                        spacing={2.2}
                        sx={{
                            maxWidth: 1600,
                            mx: "auto",
                            alignItems: "stretch",
                            textAlign: "left",
                        }}
                    >
                        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700 }}>
                            Привет 👋 Добро пожаловать
                        </Typography>

                        <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: -0.8, lineHeight: 1.05 }}>
                            StudyBytes
                        </Typography>

                        <Typography
                            sx={{
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                color: "text.secondary",
                                fontSize: { xs: 14, md: 16 },
                            }}
                        >
                            Учёба — это <b>10101010</b>. Просто:{" "}
                            <b>01110011 01101001 01101101 01110000 01101100 01100101</b>
                        </Typography>

                        <Typography sx={{ color: "text.secondary", fontSize: { xs: 16, md: 18 } }}>
                            Теория → пример → практика. Никакой “воды” — только короткие байты знаний,
                            которые можно реально применять.
                        </Typography>

                        {/* Features */}
                        <Box
                            sx={{
                                pt: 1.5,
                                display: "grid",
                                width: "100%",
                                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                gap: 1.6,
                            }}
                        >
                            <FeatureCard
                                icon={<BoltRoundedIcon color="primary" />}
                                title="Короткие уроки"
                                text="5–12 минут: только важное, без раздувания."
                            />
                            <FeatureCard
                                icon={<QuizRoundedIcon color="primary" />}
                                title="Мини-тесты"
                                text="Быстрый чек после блока: понял или пролистал."
                            />
                            <FeatureCard
                                icon={<TrendingUpRoundedIcon color="primary" />}
                                title="Прогресс"
                                text="Видишь путь: что пройдено и что дальше."
                            />
                            <FeatureCard
                                icon={<BoltRoundedIcon color="primary" />}
                                title="Практика"
                                text="Закрепляешь руками: пример → задача → результат."
                            />
                            <FeatureCard
                                icon={<BoltRoundedIcon color="primary" />}
                                title="Практика"
                                text="Закрепляешь руками: пример → задача → результат."
                            />
                            <FeatureCard
                                icon={<BoltRoundedIcon color="primary" />}
                                title="Практика"
                                text="Закрепляешь руками: пример → задача → результат."
                            />
                        </Box>

                        {/* Обычная CTA кнопка (ВАЖНО: она нужна для isCtaVisible) */}
                        <Box ref={ctaRef} sx={{ pt: 1.5, display: "flex", justifyContent: "center" }}>
                            <Button
                                onClick={scrollToCourses}
                                variant="contained"
                                color="primary"
                                endIcon={<ArrowDownwardRoundedIcon />}
                                sx={{
                                    borderRadius: 999,
                                    px: 2.6,
                                    py: 1.2,
                                    boxShadow: "0 12px 30px rgba(16,24,40,0.14)",
                                }}
                            >
                                Осмотреть курсы
                            </Button>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* ✅ Sticky mobile CTA (пилюля поверх всего, без белой полосы) */}
            <Box
                sx={{
                    display: { xs: "flex", md: "none" },
                    position: "fixed",
                    left: 0,
                    right: 0,

                    // safe-area под iPhone + отступ
                    bottom: "calc(16px + env(safe-area-inset-bottom))",

                    zIndex: "tooltip",
                    justifyContent: "center",
                    px: 2,

                    // контейнер не должен ловить клики по всей ширине
                    pointerEvents: "none",
                }}
            >
                <Box
                    sx={{
                        width: "min(560px, 100%)",
                        borderRadius: 999,
                        p: 0.7,

                        // стекло/овал (вместо белого бара)
                        backgroundColor: "rgba(18,26,51,0.72)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        backdropFilter: "blur(14px)",
                        boxShadow: "0 14px 40px rgba(0,0,0,0.35)",

                        // плавное появление/уход
                        opacity: showStickyMobileCTA ? 1 : 0,
                        transform: showStickyMobileCTA ? "translateY(0)" : "translateY(10px)",
                        transition: "opacity 180ms ease, transform 180ms ease",

                        // кликабельна только сама пилюля
                        pointerEvents: showStickyMobileCTA ? "auto" : "none",
                    }}
                >
                    <Button
                        onClick={scrollToCourses}
                        variant="contained"
                        fullWidth
                        sx={{
                            borderRadius: 999,
                            py: 1.15,
                            fontWeight: 900,
                            boxShadow: "none",
                        }}
                    >
                        Осмотреть курсы
                    </Button>
                </Box>
            </Box>

            {/* COURSES */}
            <Box
                ref={coursesRef}
                id="courses"
                component="section"
                sx={{
                    scrollMarginTop: "90px",
                    pt: { xs: 4, md: 5 },
                    pb: { xs: 7, md: 9 },
                }}
            >
                <Container maxWidth="lg">
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                            width: "100%",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: 950, m: 0 }}>
                            Курсы
                        </Typography>

                        <Box sx={{ flexGrow: 1 }} />

                        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <Chip size="small" color="success" label="Beginner — старт" />
                            <Chip size="small" color="warning" label="Intermediate — уверенно" />
                            <Chip size="small" color="error" label="Advanced — хард" />
                            <Chip size="small" variant="outlined" label="★ рейтинг пользователей" />
                        </Stack>
                    </Box>

                    {/* Filters */}
                    <Box
                        sx={{
                            mt: 1,
                            mb: 2.4,
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid rgba(16,24,40,0.08)",
                            backgroundColor: "rgba(255,255,255,0.70)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <Stack spacing={2}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <TextField
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    fullWidth
                                    placeholder="Поиск по курсам (Java, SQL, сети...)"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRoundedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <FormControl sx={{ minWidth: 190 }}>
                                    <Select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as Difficulty | "All")}
                                        displayEmpty
                                    >
                                        <MenuItem value="All">Все уровни</MenuItem>
                                        <MenuItem value="Beginner">Beginner</MenuItem>
                                        <MenuItem value="Intermediate">Intermediate</MenuItem>
                                        <MenuItem value="Advanced">Advanced</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl sx={{ minWidth: 190 }}>
                                    <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                                        <MenuItem value="rating">Сортировка: рейтинг</MenuItem>
                                        <MenuItem value="priceAsc">Сортировка: цена ↑</MenuItem>
                                        <MenuItem value="priceDesc">Сортировка: цена ↓</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TuneRoundedIcon fontSize="small" />
                                    <Typography sx={{ fontWeight: 800 }}>Цена</Typography>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {priceRange[0]} ₽ – {priceRange[1]} ₽
                                    </Typography>
                                </Stack>

                                <Slider
                                    value={priceRange}
                                    onChange={(_, v) => setPriceRange(v as number[])}
                                    valueLabelDisplay="auto"
                                    min={minPrice}
                                    max={maxPrice}
                                />
                            </Stack>

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setQuery("");
                                        setDifficulty("All");
                                        setSort("rating");
                                        setPriceRange([minPrice, maxPrice]);
                                    }}
                                >
                                    Сбросить
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Grid */}
                    {filteredCourses.length === 0 ? (
                        <Typography sx={{ color: "text.secondary", mt: 1 }}>
                            Ничего не найдено по текущим фильтрам.
                        </Typography>
                    ) : (
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: 2.4,
                            }}
                        >
                            {filteredCourses.map((c) => (
                                <Card
                                    key={c.id}
                                    sx={{
                                        height: "100%",
                                        border: "1px solid rgba(16,24,40,0.08)",
                                        boxShadow: "0 16px 40px rgba(16,24,40,0.06)",
                                        overflow: "hidden",
                                        transition: "transform 180ms ease, box-shadow 180ms ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 22px 60px rgba(16,24,40,0.10)",
                                        },
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="160"
                                        image={c.image}
                                        alt={c.title}
                                        sx={{ objectFit: "cover" }}
                                    />

                                    <CardContent>
                                        <Stack spacing={1.2}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                                <Typography sx={{ fontWeight: 900, fontSize: 18, lineHeight: 1.2 }}>
                                                    {c.title}
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    color={difficultyColor(c.difficulty)}
                                                    label={c.difficulty}
                                                    sx={{ fontWeight: 700 }}
                                                />
                                            </Stack>

                                            <Typography sx={{ color: "text.secondary" }}>{c.description}</Typography>

                                            <Stack direction="row" spacing={1.2} alignItems="center">
                                                <Rating value={c.rating} precision={0.1} readOnly />
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {c.rating.toFixed(1)}
                                                </Typography>

                                                <Box sx={{ flexGrow: 1 }} />

                                                <Chip
                                                    label={`${c.price} ₽`}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 800 }}
                                                />
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
}
