-- 상품 데이터 삽입 SQL
-- 500개의 상품을 카테고리별로 생성

-- 기존 데이터 삭제 (선택사항)
-- DELETE FROM products;

-- 타임딜 종료 시간 설정 (현재 시간 + 24시간)
DO $$
DECLARE
    time_deal_end TIMESTAMP := NOW() + INTERVAL '24 hours';
    best_rank_counter INTEGER := 1;
    i INTEGER;
BEGIN
    -- food 카테고리 (84개)
    FOR i IN 1..84 LOOP
        INSERT INTO products (name, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
        (
            CASE (i % 20)
                WHEN 0 THEN '제주 서귀포 조생 감귤 5kg ' || i || '번'
                WHEN 1 THEN '맥심 모카골드 마일드 믹스 ' || i || '번'
                WHEN 2 THEN '농심 신라면 ' || i || '번'
                WHEN 3 THEN '삼다수 2L ' || i || '번'
                WHEN 4 THEN '햇반 ' || i || '번'
                WHEN 5 THEN '호주산 소갈비찜 ' || i || '번'
                WHEN 6 THEN '한우 등심 1kg ' || i || '번'
                WHEN 7 THEN '생수 2L 24병 ' || i || '번'
                WHEN 8 THEN '오뚜기 컵밥 ' || i || '번'
                WHEN 9 THEN '농심 너구리 ' || i || '번'
                WHEN 10 THEN '불닭볶음면 ' || i || '번'
                WHEN 11 THEN '비비고 왕교자 ' || i || '번'
                WHEN 12 THEN 'CJ 햇반 ' || i || '번'
                WHEN 13 THEN '동원 참치 ' || i || '번'
                WHEN 14 THEN '오뚜기 진라면 ' || i || '번'
                WHEN 15 THEN '농심 짜파게티 ' || i || '번'
                WHEN 16 THEN 'CJ 백설 설탕 ' || i || '번'
                WHEN 17 THEN '롯데칠성 칠성사이다 ' || i || '번'
                WHEN 18 THEN '롯데칠성 스프라이트 ' || i || '번'
                ELSE '식품 상품 ' || i || '번'
            END,
            10000 + (i * 500) + (RANDOM() * 50000)::INTEGER,
            CASE WHEN i % 3 = 0 THEN 0 ELSE (5 + (i % 30)) END,
            'https://cdn.pixabay.com/photo/2017/02/26/12/27/oranges-2100108_1280.jpg',
            'food',
            CASE WHEN i % 5 = 0 THEN true ELSE false END,
            CASE WHEN i % 5 = 0 THEN time_deal_end ELSE NULL END,
            CASE WHEN i <= 8 THEN true ELSE false END,
            CASE WHEN i <= 8 THEN best_rank_counter + i - 1 ELSE NULL END,
            50 + (RANDOM() * 50)::INTEGER
        );
        IF i <= 8 THEN
            best_rank_counter := best_rank_counter + 1;
        END IF;
    END LOOP;

    -- electronics 카테고리 (84개)
    FOR i IN 1..84 LOOP
        INSERT INTO products (name, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
        (
            CASE (i % 20)
                WHEN 0 THEN '삼성 오디세이 게이밍 모니터 32인치 ' || i || '번'
                WHEN 1 THEN '애플 아이폰 15 Pro ' || i || '번'
                WHEN 2 THEN 'LG 그램 노트북 ' || i || '번'
                WHEN 3 THEN '다이슨 V12 디텍트 슬림 ' || i || '번'
                WHEN 4 THEN '로봇청소기 로보락 S8 ' || i || '번'
                WHEN 5 THEN '삼성 85인치 4K UHD TV ' || i || '번'
                WHEN 6 THEN '갤럭시 버즈3 프로 ' || i || '번'
                WHEN 7 THEN '아이패드 프로 12.9인치 ' || i || '번'
                WHEN 8 THEN '에어팟 프로 2세대 ' || i || '번'
                WHEN 9 THEN '플레이스테이션 5 ' || i || '번'
                WHEN 10 THEN '엑스박스 시리즈 X ' || i || '번'
                WHEN 11 THEN '닌텐도 스위치 ' || i || '번'
                WHEN 12 THEN '맥북 프로 16인치 ' || i || '번'
                WHEN 13 THEN '갤럭시 워치 ' || i || '번'
                WHEN 14 THEN '아이워치 ' || i || '번'
                WHEN 15 THEN '삼성 갤럭시 탭 ' || i || '번'
                WHEN 16 THEN 'LG 올레드 TV ' || i || '번'
                WHEN 17 THEN '소니 WH-1000XM5 ' || i || '번'
                WHEN 18 THEN '보스 QC45 헤드폰 ' || i || '번'
                ELSE '전자제품 ' || i || '번'
            END,
            50000 + (i * 10000) + (RANDOM() * 2000000)::INTEGER,
            CASE WHEN i % 4 = 0 THEN 0 ELSE (3 + (i % 20)) END,
            'https://cdn.pixabay.com/photo/2014/05/02/21/50/home-office-336378_1280.jpg',
            'electronics',
            CASE WHEN i % 6 = 0 THEN true ELSE false END,
            CASE WHEN i % 6 = 0 THEN time_deal_end ELSE NULL END,
            CASE WHEN i <= 8 THEN true ELSE false END,
            CASE WHEN i <= 8 THEN best_rank_counter + i - 1 ELSE NULL END,
            10 + (RANDOM() * 40)::INTEGER
        );
        IF i <= 8 THEN
            best_rank_counter := best_rank_counter + 1;
        END IF;
    END LOOP;

    -- fashion 카테고리 (84개)
    FOR i IN 1..84 LOOP
        INSERT INTO products (name, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
        (
            CASE (i % 20)
                WHEN 0 THEN '나이키 에어 줌 페가수스 러닝화 ' || i || '번'
                WHEN 1 THEN '아디다스 조거 팬츠 ' || i || '번'
                WHEN 2 THEN '노스페이스 눕시 패딩 점퍼 ' || i || '번'
                WHEN 3 THEN '나이키 에어맥스 90 ' || i || '번'
                WHEN 4 THEN '아디다스 슈퍼스타 ' || i || '번'
                WHEN 5 THEN '컨버스 척 테일러 ' || i || '번'
                WHEN 6 THEN '반스 올드스쿨 ' || i || '번'
                WHEN 7 THEN '뉴발란스 993 ' || i || '번'
                WHEN 8 THEN '아식스 젤 카야노 ' || i || '번'
                WHEN 9 THEN '프리덤 런 ' || i || '번'
                WHEN 10 THEN '조던 1 레트로 ' || i || '번'
                WHEN 11 THEN '에어포스 1 ' || i || '번'
                WHEN 12 THEN '덩크 로우 ' || i || '번'
                WHEN 13 THEN '스탠스미스 ' || i || '번'
                WHEN 14 THEN '울트라부스트 ' || i || '번'
                WHEN 15 THEN '나이키 드라이핏 티셔츠 ' || i || '번'
                WHEN 16 THEN '아디다스 트레이닝복 ' || i || '번'
                WHEN 17 THEN '노스페이스 후디 ' || i || '번'
                WHEN 18 THEN '컬럼비아 재킷 ' || i || '번'
                ELSE '패션 상품 ' || i || '번'
            END,
            30000 + (i * 5000) + (RANDOM() * 300000)::INTEGER,
            CASE WHEN i % 3 = 0 THEN 0 ELSE (10 + (i % 30)) END,
            'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_1280.jpg',
            'fashion',
            CASE WHEN i % 5 = 0 THEN true ELSE false END,
            CASE WHEN i % 5 = 0 THEN time_deal_end ELSE NULL END,
            CASE WHEN i <= 8 THEN true ELSE false END,
            CASE WHEN i <= 8 THEN best_rank_counter + i - 1 ELSE NULL END,
            20 + (RANDOM() * 60)::INTEGER
        );
        IF i <= 8 THEN
            best_rank_counter := best_rank_counter + 1;
        END IF;
    END LOOP;

    -- daily 카테고리 (84개)
    FOR i IN 1..84 LOOP
        INSERT INTO products (name, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
        (
            CASE (i % 20)
                WHEN 0 THEN '크리넥스 3겹 데코앤소프트 ' || i || '번'
                WHEN 1 THEN '물티슈 100매 ' || i || '번'
                WHEN 2 THEN '유한킴벌리 덴탈마스크 ' || i || '번'
                WHEN 3 THEN '스타벅스 SS 텀블러 ' || i || '번'
                WHEN 4 THEN '코스트코 타월 ' || i || '번'
                WHEN 5 THEN '다이소 주방용품 세트 ' || i || '번'
                WHEN 6 THEN '아이리스오카이마스크 ' || i || '번'
                WHEN 7 THEN '코스트코 베이비 와이프 ' || i || '번'
                WHEN 8 THEN '다이소 청소용품 세트 ' || i || '번'
                WHEN 9 THEN '코스트코 수건 세트 ' || i || '번'
                WHEN 10 THEN '생활용품 세트 ' || i || '번'
                WHEN 11 THEN '세탁 세제 ' || i || '번'
                WHEN 12 THEN '주방 세제 ' || i || '번'
                WHEN 13 THEN '화장지 30롤 ' || i || '번'
                WHEN 14 THEN '비누 세트 ' || i || '번'
                WHEN 15 THEN '샴푸 ' || i || '번'
                WHEN 16 THEN '린스 ' || i || '번'
                WHEN 17 THEN '바디워시 ' || i || '번'
                WHEN 18 THEN '핸드크림 ' || i || '번'
                ELSE '생활용품 ' || i || '번'
            END,
            5000 + (i * 1000) + (RANDOM() * 50000)::INTEGER,
            CASE WHEN i % 4 = 0 THEN 0 ELSE (5 + (i % 25)) END,
            'https://cdn.pixabay.com/photo/2020/03/27/11/24/toilet-paper-4973212_1280.jpg',
            'daily',
            CASE WHEN i % 5 = 0 THEN true ELSE false END,
            CASE WHEN i % 5 = 0 THEN time_deal_end ELSE NULL END,
            CASE WHEN i <= 8 THEN true ELSE false END,
            CASE WHEN i <= 8 THEN best_rank_counter + i - 1 ELSE NULL END,
            30 + (RANDOM() * 70)::INTEGER
        );
        IF i <= 8 THEN
            best_rank_counter := best_rank_counter + 1;
        END IF;
    END LOOP;

    -- furniture 카테고리 (84개)
    FOR i IN 1..84 LOOP
        INSERT INTO products (name, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
        (
            CASE (i % 20)
                WHEN 0 THEN '시디즈 T50 컴퓨터 의자 ' || i || '번'
                WHEN 1 THEN '이케아 빌리 책장 ' || i || '번'
                WHEN 2 THEN '허먼밀러 에어론 ' || i || '번'
                WHEN 3 THEN '이케아 침대 프레임 ' || i || '번'
                WHEN 4 THEN '코스트코 소파 ' || i || '번'
                WHEN 5 THEN '이케아 식탁 ' || i || '번'
                WHEN 6 THEN '코스트코 책상 ' || i || '번'
                WHEN 7 THEN '이케아 의자 ' || i || '번'
                WHEN 8 THEN '코스트코 수납장 ' || i || '번'
                WHEN 9 THEN '이케아 화장대 ' || i || '번'
                WHEN 10 THEN '옷장 ' || i || '번'
                WHEN 11 THEN '책상 의자 세트 ' || i || '번'
                WHEN 12 THEN '소파 테이블 ' || i || '번'
                WHEN 13 THEN '침대 사이드 테이블 ' || i || '번'
                WHEN 14 THEN '서랍장 ' || i || '번'
                WHEN 15 THEN '화장대 의자 ' || i || '번'
                WHEN 16 THEN '책상 조명 ' || i || '번'
                WHEN 17 THEN '침대 매트리스 ' || i || '번'
                WHEN 18 THEN '소파 쿠션 ' || i || '번'
                ELSE '가구 ' || i || '번'
            END,
            50000 + (i * 10000) + (RANDOM() * 1500000)::INTEGER,
            CASE WHEN i % 4 = 0 THEN 0 ELSE (5 + (i % 20)) END,
            'https://cdn.pixabay.com/photo/2017/08/05/22/04/chairs-2585227_1280.jpg',
            'furniture',
            CASE WHEN i % 6 = 0 THEN true ELSE false END,
            CASE WHEN i % 6 = 0 THEN time_deal_end ELSE NULL END,
            CASE WHEN i <= 8 THEN true ELSE false END,
            CASE WHEN i <= 8 THEN best_rank_counter + i - 1 ELSE NULL END,
            5 + (RANDOM() * 25)::INTEGER
        );
        IF i <= 8 THEN
            best_rank_counter := best_rank_counter + 1;
        END IF;
    END LOOP;

    -- ticket 카테고리 (80개) - 총 500개 완성
    FOR i IN 1..80 LOOP
        INSERT INTO products (name, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
        (
            CASE (i % 20)
                WHEN 0 THEN '구글 기프트코드 ' || i || '번'
                WHEN 1 THEN 'CGV 영화관람권 ' || i || '번'
                WHEN 2 THEN '롯데월드 입장권 ' || i || '번'
                WHEN 3 THEN '에버랜드 입장권 ' || i || '번'
                WHEN 4 THEN '넷플릭스 1개월 ' || i || '번'
                WHEN 5 THEN '디즈니플러스 1개월 ' || i || '번'
                WHEN 6 THEN '아마존 기프트카드 ' || i || '번'
                WHEN 7 THEN '스타벅스 기프트카드 ' || i || '번'
                WHEN 8 THEN '롯데면세점 상품권 ' || i || '번'
                WHEN 9 THEN '신세계 상품권 ' || i || '번'
                WHEN 10 THEN '하이마트 상품권 ' || i || '번'
                WHEN 11 THEN '이마트 상품권 ' || i || '번'
                WHEN 12 THEN '쿠팡 기프트카드 ' || i || '번'
                WHEN 13 THEN '배달의민족 기프트카드 ' || i || '번'
                WHEN 14 THEN '요기요 기프트카드 ' || i || '번'
                WHEN 15 THEN '카카오톡 선물하기 ' || i || '번'
                WHEN 16 THEN '문화상품권 ' || i || '번'
                WHEN 17 THEN '도서문화상품권 ' || i || '번'
                WHEN 18 THEN '해피머니 ' || i || '번'
                ELSE '상품권 ' || i || '번'
            END,
            5000 + (i * 2000) + (RANDOM() * 100000)::INTEGER,
            CASE WHEN i % 5 = 0 THEN 0 ELSE (3 + (i % 10)) END,
            'https://cdn.pixabay.com/photo/2016/07/02/09/58/google-1492582_1280.jpg',
            'ticket',
            CASE WHEN i % 7 = 0 THEN true ELSE false END,
            CASE WHEN i % 7 = 0 THEN time_deal_end ELSE NULL END,
            CASE WHEN i <= 8 THEN true ELSE false END,
            CASE WHEN i <= 8 THEN best_rank_counter + i - 1 ELSE NULL END,
            50 + (RANDOM() * 50)::INTEGER
        );
        IF i <= 8 THEN
            best_rank_counter := best_rank_counter + 1;
        END IF;
    END LOOP;

END $$;

-- 총 상품 개수 확인
SELECT COUNT(*) as total_products FROM products;
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;
