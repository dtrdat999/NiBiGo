-- ─────────────────────────────────────────────────────────────
-- NiBiGo AI Planner — seed (Phase 2 + Phase 3)
-- An toàn để chạy lại: chỉ chèn khi chưa có dữ liệu.
-- ─────────────────────────────────────────────────────────────

-- ── Destination ──────────────────────────────────────────────
insert into public.destinations (name, slug, description, region, is_active)
values (
  'Ninh Bình',
  'ninh-binh',
  'Vùng đất di sản: Tràng An, Tam Cốc, Hang Múa, Bái Đính, Cố đô Hoa Lư, Cúc Phương, Đầm Vân Long.',
  'Miền Bắc',
  true
)
on conflict (slug) do nothing;

-- ── Travel products (Phase 3) ────────────────────────────────
do $$
declare d uuid;
begin
  select id into d from public.destinations where slug = 'ninh-binh';
  if d is null then raise notice 'Chưa có destination ninh-binh'; return; end if;

  if exists (select 1 from public.products where destination_id = d) then
    raise notice 'products đã có dữ liệu — bỏ qua seed.';
    return;
  end if;

  insert into public.products
    (name, type, destination_id, description, price, price_unit, duration_hours, tags, suitable_for, availability_status, quality_score, is_active)
  values
    -- HOTELS (per_night)
    ('Homestay Tam Cốc Cozy', 'hotel', d, 'Homestay bình dị giữa đồng lúa, sạch sẽ, giá tốt cho nhóm tiết kiệm.', 500000, 'per_night', null, '{budget,nature,relaxing}', '{solo,couple,family}', 'available', 3, true),
    ('Tam Cốc Boutique View Lúa', 'hotel', d, 'Khách sạn boutique phòng đôi nhìn ra cánh đồng, ban công chụp ảnh đẹp.', 950000, 'per_night', null, '{couple,premium,photo,relaxing}', '{couple}', 'available', 4, true),
    ('Tam Coc Garden Resort', 'hotel', d, 'Resort nghỉ dưỡng có hồ bơi, vườn xanh, phù hợp thư giãn trọn vẹn.', 1500000, 'per_night', null, '{premium,relaxing,nature}', '{couple,family}', 'available', 5, true),
    ('Ninh Bình Family Hotel', 'hotel', d, 'Khách sạn phòng gia đình rộng, gần trung tâm, tiện cho trẻ nhỏ.', 800000, 'per_night', null, '{family,budget,kids}', '{family}', 'available', 3, true),
    ('Cúc Phương Eco Lodge', 'hotel', d, 'Lodge sinh thái ven rừng Cúc Phương, yên tĩnh, gần thiên nhiên.', 1200000, 'per_night', null, '{premium,nature,relaxing}', '{couple,family}', 'limited', 4, true),

    -- ACTIVITIES (per_person)
    ('Du thuyền Tràng An', 'activity', d, 'Tuyến thuyền di sản qua hang động và đền cổ, cảnh non nước tuyệt đẹp.', 250000, 'per_person', 4, '{nature,photo,relaxing,culture}', '{solo,couple,family,elderly}', 'available', 5, true),
    ('Thuyền Tam Cốc', 'activity', d, 'Xuôi dòng Ngô Đồng qua "Hạ Long trên cạn", đẹp nhất mùa lúa.', 200000, 'per_person', 3, '{nature,photo,relaxing}', '{couple,family,elderly}', 'available', 4, true),
    ('Leo Hang Múa', 'activity', d, 'Khoảng 500 bậc đá lên đỉnh ngắm toàn cảnh Tam Cốc — view đẹp nhưng khá mệt, không hợp người ngại leo.', 100000, 'per_person', 2, '{active,photo,nature}', '{solo,couple}', 'limited', 4, true),
    ('Chùa Bái Đính', 'activity', d, 'Quần thể chùa lớn, đi xe điện và hướng dẫn, nhịp tham quan nhẹ nhàng.', 200000, 'per_person', 4, '{culture,relaxing}', '{couple,family,elderly}', 'available', 4, true),
    ('Cố đô Hoa Lư', 'activity', d, 'Kinh đô xưa với đền vua Đinh, vua Lê — đậm văn hóa, dễ đi.', 120000, 'per_person', 2, '{culture,photo}', '{couple,family,elderly}', 'available', 3, true),
    ('Vườn quốc gia Cúc Phương', 'activity', d, 'Rừng nguyên sinh, cây chò ngàn năm, trung tâm cứu hộ thú — hơi nhiều đi bộ.', 180000, 'per_person', 5, '{nature,active}', '{family,solo}', 'available', 4, true),
    ('Đầm Vân Long', 'activity', d, 'Khu bảo tồn ngập nước yên ả, chèo thuyền ngắm chim và núi đá vôi.', 220000, 'per_person', 3, '{nature,photo,relaxing}', '{couple,elderly}', 'available', 4, true),
    ('Phố cổ Hoa Lư & cafe chill', 'activity', d, 'Dạo phố cổ về đêm, cafe view đẹp — hoạt động nhẹ nhàng, lãng mạn.', 150000, 'per_person', 2, '{relaxing,photo,food,culture}', '{solo,couple}', 'available', 4, true),
    ('Đạp xe làng quê', 'activity', d, 'Đạp xe thong dong qua đường làng, ruộng lúa và cầu nhỏ — nhẹ nhàng, nhiều góc ảnh.', 150000, 'per_person', 2, '{active,nature,photo,relaxing}', '{couple,family}', 'available', 4, true),
    ('Động Thiên Hà', 'activity', d, 'Hang động lung linh thạch nhũ, đi thuyền nhỏ vào động.', 180000, 'per_person', 2, '{nature,photo}', '{couple,family}', 'sold_out', 3, true),

    -- RESTAURANTS
    ('Cơm cháy đặc sản (set)', 'restaurant', d, 'Set cơm cháy giòn rụm ăn kèm ruốc/sốt — đặc sản phải thử.', 180000, 'per_person', null, '{food,budget,culture}', '{solo,couple,family}', 'available', 4, true),
    ('Set dê núi Ninh Bình', 'restaurant', d, 'Dê núi nhiều món: tái chanh, hấp, nướng — đậm đà, đặc trưng vùng đá.', 350000, 'per_person', null, '{food,culture,premium}', '{couple,family}', 'available', 5, true),
    ('Dinner set cặp đôi lãng mạn', 'restaurant', d, 'Bữa tối set menu, không gian riêng tư, hợp cặp đôi.', 450000, 'per_person', null, '{food,couple,premium,relaxing}', '{couple}', 'limited', 5, true),
    ('Mâm cơm gia đình đặc sản', 'restaurant', d, 'Mâm cơm nhiều món cho cả nhà, tính theo mâm.', 600000, 'per_group', null, '{food,family}', '{family}', 'available', 3, true),
    ('Bún/miến lươn & đặc sản chợ', 'restaurant', d, 'Bữa nhẹ địa phương: bún/miến lươn, quà chợ — ngon và tiết kiệm.', 120000, 'per_person', null, '{food,budget}', '{solo,couple,family}', 'available', 3, true),

    -- TRANSPORTS
    ('Xe ghép Hà Nội–Ninh Bình (khứ hồi)', 'transport', d, 'Xe ghép theo chỗ, tiết kiệm, đón/trả linh hoạt.', 200000, 'per_person', null, '{budget}', '{solo,couple,family}', 'available', 3, true),
    ('Limousine Hà Nội–Ninh Bình (khứ hồi)', 'transport', d, 'Limousine ghế êm, đưa đón tận nơi, thoải mái cho cặp đôi.', 300000, 'per_person', null, '{premium,relaxing}', '{couple,family}', 'available', 4, true),
    ('Xe riêng 4 chỗ (khứ hồi)', 'transport', d, 'Xe riêng 4 chỗ chủ động lịch trình, riêng tư.', 1600000, 'per_group', null, '{premium,relaxing}', '{couple}', 'available', 4, true),
    ('Xe riêng 7 chỗ (khứ hồi)', 'transport', d, 'Xe riêng 7 chỗ rộng rãi cho gia đình/nhóm.', 2000000, 'per_group', null, '{family,premium}', '{family,group}', 'available', 4, true),

    -- COMBOS (per_person)
    ('Combo nghỉ dưỡng cặp đôi 2N1Đ', 'combo', d, 'Gói gợi ý: boutique view lúa + dinner cặp đôi + du thuyền — lãng mạn, nhẹ nhàng.', 2500000, 'per_person', null, '{couple,premium,relaxing,photo}', '{couple}', 'limited', 5, true),
    ('Combo gia đình cuối tuần', 'combo', d, 'Gói gợi ý cho gia đình: khách sạn gia đình + Tràng An + mâm cơm đặc sản.', 2200000, 'per_person', null, '{family,kids,relaxing}', '{family}', 'available', 4, true);

  raise notice 'Đã seed % products.', (select count(*) from public.products where destination_id = d);
end $$;

-- ── Knowledge documents (RAG — Phase 6 sẽ tạo embeddings) ─────
do $$
begin
  if exists (select 1 from public.knowledge_documents) then
    raise notice 'knowledge_documents đã có dữ liệu — bỏ qua.';
    return;
  end if;

  insert into public.knowledge_documents (title, source_type, content, is_active) values
    ('Lưu ý Hang Múa', 'product_note',
     'Hang Múa có khoảng 500 bậc đá lên đỉnh, view toàn cảnh Tam Cốc rất đẹp nhưng khá mệt. Không phù hợp người ngại leo, người lớn tuổi, hoặc gia đình có trẻ nhỏ. Gợi ý thay thế nhẹ nhàng: đạp xe làng quê, phố cổ Hoa Lư, Đầm Vân Long.', true),
    ('Tràng An hay Tam Cốc?', 'faq',
     'Tràng An: tuyến thuyền dài hơn, qua nhiều hang và phim trường, hùng vĩ. Tam Cốc: ngắn hơn, đẹp nhất mùa lúa chín. Nếu chỉ chọn một và thích cảnh non nước đa dạng, ưu tiên Tràng An.', true),
    ('Mùa đẹp đi Ninh Bình', 'faq',
     'Tam Cốc đẹp nhất mùa lúa chín, khoảng cuối tháng 5 đến đầu tháng 6. Mùa thu mát mẻ, dễ chịu cho tham quan. Tránh ngày mưa lớn vì đi thuyền và leo núi sẽ bất tiện.', true),
    ('Chính sách hủy/đổi (demo)', 'policy',
     'Đây là môi trường demo: booking request chỉ là yêu cầu, chưa phát sinh giao dịch thật. Đội ngũ NiBiGo sẽ liên hệ xác nhận dịch vụ, lịch trình và chi phí trước khi chốt. Có thể điều chỉnh hoặc hủy yêu cầu trước khi xác nhận.', true);

  raise notice 'Đã seed knowledge_documents.';
end $$;

-- ── Demo users (xem supabase/README.md) ──────────────────────
-- Đăng ký guest@nibigo.demo + admin@nibigo.demo qua /register, rồi chạy:
update public.profiles set role = 'admin' where email = 'admin@nibigo.demo';
