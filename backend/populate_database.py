from app.db.session import SessionLocal
from app.models.user import User
from app.models.recipe import Recipe
from app.models.article import Article
from app.models.menu import MenuPlan
from app.models.refresh_token import RefreshToken
from app.models.order import Order, OrderItem
from app.core.security import get_password_hash
from datetime import datetime
import json


def populate_database():
    db = SessionLocal()
    try:
        db.query(RefreshToken).delete()
        db.query(MenuPlan).delete()
        db.query(Article).delete()
        db.query(Recipe).delete()
        db.query(User).delete()
        db.commit()

        admin_user = User(
            email="sona22.11.2003@gmail.com",
            hashed_password=get_password_hash("somethingSerious"),
            full_name="admin",
            is_active=True,
        )

        test_user = User(
            email="test@example.com",
            hashed_password=get_password_hash("short123"),
            full_name="testUser",
            is_active=True,
        )

        db.add_all([admin_user, test_user])
        db.commit()
        print("Админ и пользователь добавлены")

        recipes = [
            Recipe(
                title="Гречневая каша с курицей",
                description="Питательная гречневая каша с нежным куриным филе",
                ingredients=json.dumps(
                    [
                        {"name": "Гречка", "amount": "100", "unit": "г"},
                        {"name": "Куриное филе", "amount": "150", "unit": "г"},
                        {"name": "Лук репчатый", "amount": "1", "unit": "шт"},
                        {"name": "Морковь", "amount": "1", "unit": "шт"},
                        {"name": "Оливковое масло", "amount": "1", "unit": "ст.л"},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Промойте гречку и отварите до готовности",
                        "Нарежьте куриное филе кубиками и обжарьте на сковороде",
                        "Добавьте нарезанные лук и морковь, тушите 10 минут",
                        "Смешайте гречку с курицей и овощами",
                        "Подавайте горячим",
                    ]
                ),
                cooking_time=30,
                calories=350,
                protein=25,
                carbs=45,
                fat=8,
                category="main",
                difficulty="easy",
                image_url="/uploads/images/recipes_images/recipe_1.jpg",
                tags=json.dumps(["гречка", "курица", "здоровое", "обед", "белковое"]),
                is_active=1,
            ),
            Recipe(
                title="Овсянка с ягодами",
                description="Полезный завтрак с овсянкой и свежими ягодами",
                ingredients=json.dumps(
                    [
                        {"name": "Овсяные хлопья", "amount": "50", "unit": "г"},
                        {"name": "Молоко", "amount": "200", "unit": "мл"},
                        {"name": "Мед", "amount": "1", "unit": "ч.л"},
                        {"name": "Смесь ягод", "amount": "100", "unit": "г"},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Доведите молоко до кипения",
                        "Добавьте овсяные хлопья и варите 5-7 минут",
                        "Добавьте мед и перемешайте",
                        "Украсьте ягодами перед подачей",
                    ]
                ),
                cooking_time=10,
                calories=250,
                protein=10,
                carbs=45,
                fat=5,
                category="breakfast",
                difficulty="very_easy",
                image_url="/uploads/images/recipes_images/recipe_2.jpg",
                tags=json.dumps(
                    ["овсянка", "завтрак", "ягоды", "быстро", "вегетарианский"]
                ),
                is_active=1,
            ),
            Recipe(
                title="Салат Цезарь с курицей",
                description="Классический салат Цезарь с куриной грудкой",
                ingredients=json.dumps(
                    [
                        {"name": "Куриная грудка", "amount": "200", "unit": "г"},
                        {"name": "Салат Романо", "amount": "150", "unit": "г"},
                        {"name": "Пармезан", "amount": "50", "unit": "г"},
                        {"name": "Сухарики", "amount": "50", "unit": "г"},
                        {"name": "Соус Цезарь", "amount": "2", "unit": "ст.л"},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Обжарьте куриную грудку до готовности",
                        "Нарежьте салат крупными кусками",
                        "Натрите пармезан",
                        "Смешайте все ингредиенты в миске",
                        "Заправьте соусом и подавайте",
                    ]
                ),
                cooking_time=20,
                calories=380,
                protein=35,
                carbs=20,
                fat=18,
                category="salad",
                difficulty="easy",
                image_url="/uploads/images/recipes_images/recipe_3.jpg",
                tags=json.dumps(["салат", "курица", "цезарь", "легкий", "белковый"]),
                is_active=1,
            ),
            Recipe(
                title="Лосось на пару с брокколи",
                description="Диетическое блюдо с лососем и брокколи на пару",
                ingredients=json.dumps(
                    [
                        {"name": "Филе лосося", "amount": "200", "unit": "г"},
                        {"name": "Брокколи", "amount": "300", "unit": "г"},
                        {"name": "Лимон", "amount": "0.5", "unit": "шт"},
                        {"name": "Укроп", "amount": "10", "unit": "г"},
                        {"name": "Оливковое масло", "amount": "1", "unit": "ст.л"},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Разделите брокколи на соцветия",
                        "Положите лосось и брокколи в пароварку",
                        "Готовьте 15-20 минут",
                        "Подавайте с лимоном и укропом",
                        "Полейте оливковым маслом",
                    ]
                ),
                cooking_time=25,
                calories=320,
                protein=30,
                carbs=12,
                fat=18,
                category="main",
                difficulty="medium",
                image_url="/uploads/images/recipes_images/recipe_4.jpg",
                tags=json.dumps(
                    ["лосось", "брокколи", "на пару", "омега-3", "диетическое"]
                ),
                is_active=1,
            ),
            Recipe(
                title="Творожная запеканка",
                description="Нежная творожная запеканка с изюмом",
                ingredients=json.dumps(
                    [
                        {"name": "Творог", "amount": "500", "unit": "г"},
                        {"name": "Яйца", "amount": "3", "unit": "шт"},
                        {"name": "Манная крупа", "amount": "3", "unit": "ст.л"},
                        {"name": "Изюм", "amount": "100", "unit": "г"},
                        {"name": "Сахар", "amount": "3", "unit": "ст.л"},
                        {"name": "Ванилин", "amount": "1", "unit": "ч.л"},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Смешайте творог с яйцами и сахаром",
                        "Добавьте манку и изюм",
                        "Выложите в форму для запекания",
                        "Выпекайте при 180°C 40 минут",
                        "Подавайте охлажденным",
                    ]
                ),
                cooking_time=50,
                calories=280,
                protein=25,
                carbs=30,
                fat=10,
                category="dessert",
                difficulty="medium",
                image_url="/uploads/images/recipes_images/recipe_5.jpg",
                tags=json.dumps(
                    ["творог", "запеканка", "десерт", "кальций", "выпечка"]
                ),
                is_active=1,
            ),
            Recipe(
                title="Овощной суп-пюре",
                description="Кремовый суп из брокколи и цветной капусты",
                ingredients=json.dumps(
                    [
                        {"name": "Брокколи", "amount": "300", "unit": "г"},
                        {"name": "Цветная капуста", "amount": "300", "unit": "г"},
                        {"name": "Картофель", "amount": "2", "unit": "шт"},
                        {"name": "Лук", "amount": "1", "unit": "шт"},
                        {"name": "Сливки 10%", "amount": "100", "unit": "мл"},
                        {"name": "Соль, перец", "amount": "по вкусу", "unit": ""},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Нарежьте овощи кубиками",
                        "Варите в подсоленной воде 20 минут",
                        "Измельчите блендером до кремообразной консистенции",
                        "Добавьте сливки и прогрейте",
                        "Подавайте с сухариками",
                    ]
                ),
                cooking_time=30,
                calories=180,
                protein=8,
                carbs=25,
                fat=5,
                category="soup",
                difficulty="easy",
                image_url="/uploads/images/recipes_images/recipe_6.jpg",
                tags=json.dumps(
                    ["суп", "брокколи", "вегетарианский", "легкий", "обед"]
                ),
                is_active=1,
            ),
            Recipe(
                title="Куриные котлеты на пару",
                description="Диетические котлеты из куриного филе",
                ingredients=json.dumps(
                    [
                        {"name": "Куриное филе", "amount": "500", "unit": "г"},
                        {"name": "Лук", "amount": "1", "unit": "шт"},
                        {"name": "Чеснок", "amount": "2", "unit": "зубчика"},
                        {"name": "Яйцо", "amount": "1", "unit": "шт"},
                        {"name": "Панировочные сухари", "amount": "2", "unit": "ст.л"},
                        {"name": "Соль, специи", "amount": "по вкусу", "unit": ""},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Измельчите куриное филе в блендере",
                        "Добавьте лук, чеснок, яйцо и специи",
                        "Сформируйте котлеты",
                        "Готовьте на пару 25-30 минут",
                        "Подавайте с овощами",
                    ]
                ),
                cooking_time=40,
                calories=220,
                protein=35,
                carbs=10,
                fat=8,
                category="main",
                difficulty="medium",
                image_url="/uploads/images/recipes_images/recipe_7.jpg",
                tags=json.dumps(
                    ["курица", "котлеты", "на пару", "белковое", "диетическое"]
                ),
                is_active=1,
            ),
            Recipe(
                title="Фруктовый салат с йогуртом",
                description="Лёгкий салат из свежих фруктов с натуральным йогуртом",
                ingredients=json.dumps(
                    [
                        {"name": "Яблоко", "amount": "1", "unit": "шт"},
                        {"name": "Банан", "amount": "1", "unit": "шт"},
                        {"name": "Киви", "amount": "2", "unit": "шт"},
                        {"name": "Апельсин", "amount": "1", "unit": "шт"},
                        {"name": "Натуральный йогурт", "amount": "150", "unit": "г"},
                        {"name": "Мёд", "amount": "1", "unit": "ч.л"},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Нарежьте все фрукты кубиками",
                        "Смешайте в салатнице",
                        "Заправьте йогуртом с медом",
                        "Охладите 15 минут перед подачей",
                    ]
                ),
                cooking_time=10,
                calories=200,
                protein=6,
                carbs=40,
                fat=2,
                category="dessert",
                difficulty="very_easy",
                image_url="/uploads/images/recipes_images/recipe_8.jpg",
                tags=json.dumps(["фрукты", "салат", "десерт", "легкий", "витамины"]),
                is_active=1,
            ),
            Recipe(
                title="Рис с овощами в воке",
                description="Жареный рис с овощами по-азиатски",
                ingredients=json.dumps(
                    [
                        {"name": "Рис отварной", "amount": "300", "unit": "г"},
                        {"name": "Морковь", "amount": "1", "unit": "шт"},
                        {"name": "Болгарский перец", "amount": "1", "unit": "шт"},
                        {"name": "Зелёный горошек", "amount": "100", "unit": "г"},
                        {"name": "Яйцо", "amount": "2", "unit": "шт"},
                        {"name": "Соевый соус", "amount": "2", "unit": "ст.л"},
                        {"name": "Кунжутное масло", "amount": "1", "unit": "ст.л"},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Нарежьте овощи соломкой",
                        "Обжарьте яйца и отложите",
                        "Обжарьте овощи в воке 5 минут",
                        "Добавьте рис и соевый соус",
                        "Смешайте с яйцами и подавайте",
                    ]
                ),
                cooking_time=25,
                calories=350,
                protein=12,
                carbs=60,
                fat=8,
                category="main",
                difficulty="medium",
                image_url="/uploads/images/recipes_images/recipe_9.jpg",
                tags=json.dumps(["рис", "овощи", "вок", "вегетарианский", "азиатская"]),
                is_active=1,
            ),
            Recipe(
                title="Смузи с бананом и шпинатом",
                description="Энергетический смузи для завтрака",
                ingredients=json.dumps(
                    [
                        {"name": "Банан", "amount": "1", "unit": "шт"},
                        {"name": "Шпинат свежий", "amount": "50", "unit": "г"},
                        {"name": "Молоко миндальное", "amount": "200", "unit": "мл"},
                        {"name": "Протеиновый порошок", "amount": "1", "unit": "совок"},
                        {"name": "Семена чиа", "amount": "1", "unit": "ч.л"},
                        {"name": "Мёд", "amount": "1", "unit": "ч.л"},
                    ]
                ),
                instructions=json.dumps(
                    [
                        "Нарежьте банан",
                        "Сложите все ингредиенты в блендер",
                        "Взбивайте до однородной массы 1-2 минуты",
                        "Перелейте в стакан и подавайте сразу",
                    ]
                ),
                cooking_time=5,
                calories=250,
                protein=25,
                carbs=35,
                fat=5,
                category="breakfast",
                difficulty="very_easy",
                image_url="/uploads/images/recipes_images/recipe_10.jpg",
                tags=json.dumps(["смузи", "банан", "шпинат", "завтрак", "быстро"]),
                is_active=1,
            ),
        ]

        db.add_all(recipes)
        db.commit()
        print(f"Добавлено {len(recipes)} статей")

        articles = [
            Article(
                title="10 принципов здорового питания",
                content="""Здоровое питание — это не диета, а образ жизни. Вот основные принципы:
                1. Ешьте разнообразную пищу
                2. Контролируйте размер порций
                3. Пейте достаточное количество воды
                4. Ограничьте потребление сахара и соли
                5. Ешьте больше овощей и фруктов
                6. Выбирайте цельнозерновые продукты
                7. Включайте белок в каждый прием пищи
                8. Готовьте дома
                9. Ешьте медленно и осознанно
                10. Не пропускайте завтрак""",
                author="Доктор Анна Иванова",
                category="nutrition",
                read_time=5,
                published_at=datetime(2025, 1, 15, 10, 30),
                image_url="/uploads/images/article_images/article_1.jpg",
                tags=json.dumps(["питание", "здоровье", "советы", "диета"]),
                is_active=1,
            ),
            Article(
                title="Как начать тренироваться: руководство для начинающих",
                content="""Начать тренироваться — это всегда волнительный шаг, и самый важный совет здесь: не стремитесь к идеалу с первого дня. Главная ошибка новичков — попытка объять необъятное, когда после долгого перерыва или полного отсутствия опыта человек приходит в зал пять раз в неделю и выкладывается на сто процентов. Такая стратегия приводит лишь к выгоранию, сильной крепатуре и разочарованию в себе. Вместо этого воспринимайте первые два месяца как этап знакомства и адаптации. Начните с двух-трех занятий в неделю, выбрав тот вид активности, который действительно приносит вам удовольствие: будь то прогулка быстрым шагом, плавание, легкая растяжка или работа с собственным весом. Техника выполнения упражнений на начальном этапе важнее веса отягощения, поэтому не стесняйтесь обращаться к тренеру или обучающим видео — правильное положение корпуса защитит вас от травм и заложит базу для будущего прогресса. Помните, что организм перестраивается не за одну неделю, поэтому не ругайте себя за медленный темп: регулярность важнее интенсивности. Сделайте привычку удобной: подготовьте форму заранее, составьте расписание, в котором спорт будет не подвигом, а неотъемлемой частью дня, как чистка зубов. И наконец, не сравнивайте себя с другими — ваше тело учится двигаться по-новому, и любое, даже самое скромное усилие уже является большим шагом вперед. Дайте себе время, будьте мягки к себе, и очень скоро вы начнете замечать не только изменения в зеркале, но и то, как прибавляется энергия, улучшается настроение и появляется вкус к движению.""",
                author="Тренер Максим Петров",
                category="fitness",
                read_time=5,
                published_at=datetime(2025, 1, 10, 14, 20),
                image_url="/uploads/images/article_images/article_2.jpg",
                tags=json.dumps(["тренировки", "спорт", "начало", "мотивация"]),
                is_active=1,
            ),
            Article(
                title="Важность витамина D для здоровья",
                content="""Витамин D — один из самых важных витаминов для нашего организма. 
                Он участвует в усвоении кальция, укреплении иммунитета и профилактике многих заболеваний.
                Основные источники витамина D:
                - Солнечный свет (15-20 минут в день)
                - Жирная рыба (лосось, скумбрия)
                - Яичные желтки
                - Обогащенные продукты
                
                Симптомы дефицита витамина D:
                - Усталость и слабость
                - Боль в костях и суставах
                - Частые простуды
                - Депрессия и плохое настроение""",
                author="Нутрициолог Ольга Смирнова",
                category="health",
                read_time=6,
                published_at=datetime(2024, 1, 5, 9, 15),
                image_url="/uploads/images/article_images/article_3.jpg",
                tags=json.dumps(["витамины", "здоровье", "иммунитет", "питание"]),
                is_active=1,
            ),
            Article(
                title="Медитация для снижения стресса",
                content="""Медитация — эффективный способ борьбы со стрессом и тревогой.
                Простая техника для начинающих:
                1. Найдите тихое место
                2. Сядьте удобно с прямой спиной
                3. Закройте глаза и сделайте 3 глубоких вдоха
                4. Сосредоточьтесь на дыхании
                5. Не пытайтесь остановить мысли, просто наблюдайте за ними
                6. Начните с 5 минут в день
                7. Постепенно увеличивайте время
                
                Польза медитации:
                - Снижение уровня стресса
                - Улучшение концентрации
                - Улучшение качества сна
                - Снижение тревожности
                - Повышение осознанности""",
                author="Психолог Елена Ковалева",
                category="wellness",
                read_time=8,
                published_at=datetime(2024, 1, 3, 16, 45),
                image_url="/uploads/images/article_images/article_4.jpg",
                tags=json.dumps(["медитация", "стресс", "психология", "осознанность"]),
                is_active=1,
            ),
            Article(
                title="Пребиотики и пробиотики: в чем разница?",
                content="""Пребиотики и пробиотики — это два разных, но взаимосвязанных понятия в питании.
                
                Пробиотики — это живые микроорганизмы, которые приносят пользу здоровью:
                - Лактобактерии
                - Бифидобактерии
                - Содержатся в йогурте, кефире, квашеной капусте
                
                Пребиотики — это пища для пробиотиков:
                - Инулин
                - Фруктоолигосахариды
                - Содержатся в бананах, чесноке, луке, спарже
                
                Для здоровья кишечника важно употреблять и пребиотики, и пробиотики.""",
                author="Гастроэнтеролог Сергей Волков",
                category="health",
                read_time=5,
                published_at=datetime(2023, 12, 28, 11, 30),
                image_url="/uploads/images/article_images/article_5.jpg",
                tags=json.dumps(["кишечник", "питание", "пробиотики", "здоровье"]),
                is_active=1,
            ),
            Article(
                title="Функциональный тренинг: что это и зачем?",
                content="""Функциональный тренинг — это тренировки, которые имитируют движения из повседневной жизни.
                
                Основные упражнения:
                - Приседания
                - Выпады
                - Тяги
                - Жимы
                - Планки
                
                Преимущества функционального тренинга:
                1. Улучшение координации и баланса
                2. Увеличение силы и выносливости
                3. Снижение риска травм в быту
                4. Улучшение осанки
                5. Сжигание калорий
                
                Начните с 2-3 тренировок в неделю по 30-45 минут.""",
                author="Тренер Алексей Соколов",
                category="fitness",
                read_time=6,
                published_at=datetime(2023, 12, 20, 15, 10),
                image_url="/uploads/images/article_images/article_6.jpg",
                tags=json.dumps(["тренировки", "функциональный", "сила", "фитнес"]),
                is_active=1,
            ),
            Article(
                title="Средиземноморская диета: польза и принципы",
                content="""Средиземноморская диета признана одной из самых здоровых в мире.
                
                Основные принципы:
                - Оливковое масло как основной источник жиров
                - Много овощей и фруктов
                - Цельнозерновые продукты
                - Рыба и морепродукты 2-3 раза в неделю
                - Умеренное потребление молочных продуктов
                - Красное мясо редко
                - Бокал красного вина (по желанию)
                
                Польза для здоровья:
                - Снижение риска сердечно-сосудистых заболеваний
                - Профилактика диабета 2 типа
                - Улучшение когнитивных функций
                - Поддержание здорового веса""",
                author="Диетолог Мария Кузнецова",
                category="nutrition",
                read_time=7,
                published_at=datetime(2023, 12, 15, 13, 25),
                image_url="/uploads/images/article_images/article_7.jpg",
                tags=json.dumps(["диета", "средиземноморская", "питание", "здоровье"]),
                is_active=1,
            ),
            Article(
                title="Цифровой детокс: как отдохнуть от гаджетов",
                content="""Цифровой детокс — это временный отказ от цифровых устройств для восстановления ментального здоровья.
                
                Как провести цифровой детокс:
                1. Установите временные рамки (24 часа, выходные, неделя)
                2. Уведомите близких о своем плане
                3. Удалите приложения с телефона
                4. Найдите альтернативные занятия:
                   - Чтение книг
                   - Прогулки на природе
                   - Рисование или рукоделие
                   - Кулинария
                   - Общение с близкими
                
                Польза цифрового детокса:
                - Снижение стресса
                - Улучшение качества сна
                - Повышение концентрации
                - Улучшение отношений
                - Возвращение в реальный мир""",
                author="Психолог Дарья Новикова",
                category="wellness",
                read_time=6,
                published_at=datetime(2023, 12, 10, 10, 50),
                image_url="/uploads/images/article_images/article_8.jpg",
                tags=json.dumps(["детокс", "гаджеты", "психология", "осознанность"]),
                is_active=1,
            ),
            Article(
                title="Питьевой режим: сколько воды нужно пить?",
                content="""Вода необходима для функционирования всех систем организма.
                
                Как рассчитать свою норму:
                - 30-35 мл на 1 кг веса тела
                - Пример: при весе 70 кг — 2100-2450 мл в день
                
                Факторы, увеличивающие потребность в воде:
                - Физическая активность
                - Жаркая погода
                - Болезнь (особенно с температурой)
                - Беременность и кормление грудью
                
                Признаки обезвоживания:
                - Жажда
                - Сухость во рту
                - Усталость
                - Головная боль
                - Темная моча
                
                Советы:
                - Носите с собой бутылку воды
                - Пейте перед едой
                - Ешьте водосодержащие продукты (огурцы, арбуз)""",
                author="Нутрициолог Ирина Федорова",
                category="nutrition",
                read_time=5,
                published_at=datetime(2023, 12, 5, 12, 15),
                image_url="/uploads/images/article_images/article_9.jpg",
                tags=json.dumps(["вода", "гидратация", "здоровье", "питание"]),
                is_active=1,
            ),
            Article(
                title="Йога для начинающих: с чего начать?",
                content="""Йога — это не просто физические упражнения, а целостная система самопознания.
                
                Что понадобится для начала:
                - Коврик для йоги
                - Удобная одежда
                - Бутылка воды
                - Открытое сердце и разум
                
                Простые асаны для начинающих:
                1. Поза горы (Тадасана)
                2. Поза дерева (Врикшасана)
                3. Поза собаки мордой вниз (Адхо Мукха Шванасана)
                4. Поза ребенка (Баласана)
                5. Поза кобры (Бхуджангасана)
                
                Советы для начинающих:
                - Начните с занятий для начинающих
                - Не сравнивайте себя с другими
                - Слушайте свое тело
                - Дышите глубоко и осознанно
                - Будьте терпеливы к себе""",
                author="Инструктор йоги Анна Медведева",
                category="fitness",
                read_time=8,
                published_at=datetime(2023, 11, 28, 17, 30),
                image_url="/uploads/images/article_images/article_10.jpg",
                tags=json.dumps(["йога", "растяжка", "медитация", "фитнес"]),
                is_active=1,
            ),
        ]

        db.add_all(articles)
        db.commit()
        print(f"Добавлено {len(articles)} статей")

        print("Добавление меню")
        import os

        pdf_dir = "uploads/menu_pdfs/"
        os.makedirs(pdf_dir, exist_ok=True)

        menu_plans = [
            MenuPlan(
                title="Меню 1200-1300 ккал",
                description="Рацион для активного снижения веса",
                calories=1250,
                protein=80,
                carbs=100,
                fat=40,
                goal="loss",
                difficulty="easy",
                days=28,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_1200_1300.pdf",
                pdf_url="/uploads/menu_pdfs/menu_1200_1300.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 1300-1400 ккал",
                description="Рацион для плавного снижения веса",
                calories=1350,
                protein=85,
                carbs=115,
                fat=45,
                goal="loss",
                difficulty="easy",
                days=7,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_1300_1400.pdf",
                pdf_url="/uploads/menu_pdfs/menu_1300_1400.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 1400-1500 ккал",
                description="Рацион для умеренного снижения веса",
                calories=1450,
                protein=90,
                carbs=130,
                fat=50,
                goal="loss",
                difficulty="easy",
                days=28,
                price=1990.00,
               items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_1400_1500.pdf",
                pdf_url="/uploads/menu_pdfs/menu_1400_1500.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 1500-1600 ккал",
                description="Рацион для поддержания и лёгкого похудения",
                calories=1550,
                protein=95,
                carbs=150,
                fat=55,
                goal="loss",
                difficulty="medium",
                days=28,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_1500_1600.pdf",
                pdf_url="/uploads/menu_pdfs/menu_1500_1600.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 1600-1700 ккал",
                description="Сбалансированный рацион для поддержания веса",
                calories=1650,
                protein=100,
                carbs=180,
                fat=60,
                goal="maintain",
                difficulty="medium",
                days=28,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_1600_1700.pdf",
                pdf_url="/uploads/menu_pdfs/menu_1600_1700.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 1700-1800 ккал",
                description="Рацион для активного образа жизни",
                calories=1750,
                protein=110,
                carbs=200,
                fat=65,
                goal="maintain",
                difficulty="medium",
                days=28,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_1700_1800.pdf",
                pdf_url="/uploads/menu_pdfs/menu_1700_1800.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 1800-1900 ккал",
                description="Рацион для поддержания веса при высокой активности",
                calories=1850,
                protein=120,
                carbs=220,
                fat=70,
                goal="maintain",
                difficulty="medium",
                days=28,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_1800_1900.pdf",
                pdf_url="/uploads/menu_pdfs/menu_1800_1900.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 1900-2000 ккал",
                description="Рацион для поддержания веса и набора мышц",
                calories=1950,
                protein=130,
                carbs=240,
                fat=75,
                goal="maintain",
                difficulty="medium",
                days=28,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_1900_2000.pdf",
                pdf_url="/uploads/menu_pdfs/menu_1900_2000.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 2000-2200 ккал",
                description="Рацион для набора мышечной массы",
                calories=2100,
                protein=140,
                carbs=270,
                fat=80,
                goal="gain",
                difficulty="hard",
                days=28,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_2000_2200.pdf",
                pdf_url="/uploads/menu_pdfs/menu_2000_2200.pdf",
                is_active=1,
            ),
            MenuPlan(
                title="Меню 2200-2500 ккал",
                description="Высококалорийный рацион для активного набора массы",
                calories=2350,
                protein=155,
                carbs=320,
                fat=90,
                goal="gain",
                difficulty="hard",
                days=28,
                price=1990.00,
                items=json.dumps(
                    ["КБЖУ к каждому блюду"]
                ),
                pdf_filename="menu_2200_2500.pdf",
                pdf_url="/uploads/menu_pdfs/menu_2200_2500.pdf",
                is_active=1,
            ),
        ]

        db.add_all(menu_plans)
        db.commit()
        print(f"Добавлено {len(menu_plans)} планов меню")

        print("С бд все ок")

    except Exception as e:
        print(f"Ошибка: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    populate_database()
