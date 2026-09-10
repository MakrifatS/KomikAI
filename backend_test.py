#!/usr/bin/env python3
"""
Backend API Test Suite for KomikAI Platform
Tests all endpoints as specified in the review request
"""

import requests
import json
import time
from typing import Dict, List, Optional

# Base URL from environment
BASE_URL = "https://indie-comic-vault.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(test_name: str, passed: bool, details: str = ""):
    status = f"{Colors.GREEN}✅ PASS{Colors.END}" if passed else f"{Colors.RED}❌ FAIL{Colors.END}"
    print(f"\n{status} | {test_name}")
    if details:
        print(f"  └─ {details}")

def log_section(section_name: str):
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}{section_name}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")

# Global storage for test data
test_data = {
    "comics": [],
    "chapters": [],
    "free_chapter_id": None,
    "locked_chapter_id": None,
    "comic_id": None
}

def test_public_comics_list():
    """Test 1: GET /api/comics -> returns only PUBLISHED comics (expect 5)"""
    log_section("TEST 1: Public Comics List")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/comics", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/comics", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if "comics" not in data:
            log_test("GET /api/comics", False, "Response missing 'comics' key")
            return False
        
        comics = data["comics"]
        test_data["comics"] = comics
        
        # Should have 5 PUBLISHED comics (6th is UNDER_REVIEW)
        if len(comics) != 5:
            log_test("GET /api/comics", False, f"Expected 5 PUBLISHED comics, got {len(comics)}")
            return False
        
        # Verify all are PUBLISHED
        all_published = all(c.get("status") == "PUBLISHED" for c in comics)
        if not all_published:
            log_test("GET /api/comics", False, "Not all comics have status PUBLISHED")
            return False
        
        log_test("GET /api/comics", True, f"Returned 5 PUBLISHED comics in {elapsed:.2f}s")
        return True
        
    except Exception as e:
        log_test("GET /api/comics", False, f"Exception: {str(e)}")
        return False

def test_comics_sorting():
    """Test 2: GET /api/comics?sort=popular and sort=latest"""
    log_section("TEST 2: Comics Sorting")
    
    results = []
    
    # Test popular sort
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/comics?sort=popular", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/comics?sort=popular", False, f"Expected 200, got {response.status_code}")
            results.append(False)
        else:
            data = response.json()
            comics = data.get("comics", [])
            
            # Check if sorted by views descending
            views = [c.get("views", 0) for c in comics]
            is_sorted = all(views[i] >= views[i+1] for i in range(len(views)-1))
            
            if is_sorted:
                log_test("GET /api/comics?sort=popular", True, f"Sorted by views DESC in {elapsed:.2f}s")
                results.append(True)
            else:
                log_test("GET /api/comics?sort=popular", False, "Not sorted by views DESC")
                results.append(False)
                
    except Exception as e:
        log_test("GET /api/comics?sort=popular", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test latest sort
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/comics?sort=latest", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/comics?sort=latest", False, f"Expected 200, got {response.status_code}")
            results.append(False)
        else:
            data = response.json()
            comics = data.get("comics", [])
            
            # Check if sorted by createdAt descending (most recent first)
            dates = [c.get("createdAt", "") for c in comics]
            is_sorted = all(dates[i] >= dates[i+1] for i in range(len(dates)-1))
            
            if is_sorted:
                log_test("GET /api/comics?sort=latest", True, f"Sorted by createdAt DESC in {elapsed:.2f}s")
                results.append(True)
            else:
                log_test("GET /api/comics?sort=latest", False, "Not sorted by createdAt DESC")
                results.append(False)
                
    except Exception as e:
        log_test("GET /api/comics?sort=latest", False, f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def test_comics_filtering():
    """Test 3: GET /api/comics?genre=Fantasy and ?q=neon"""
    log_section("TEST 3: Comics Filtering")
    
    results = []
    
    # Test genre filter
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/comics?genre=Fantasy", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/comics?genre=Fantasy", False, f"Expected 200, got {response.status_code}")
            results.append(False)
        else:
            data = response.json()
            comics = data.get("comics", [])
            
            # All should be Fantasy genre
            all_fantasy = all(c.get("genre") == "Fantasy" for c in comics)
            
            if all_fantasy and len(comics) > 0:
                log_test("GET /api/comics?genre=Fantasy", True, f"Returned {len(comics)} Fantasy comics in {elapsed:.2f}s")
                results.append(True)
            else:
                log_test("GET /api/comics?genre=Fantasy", False, f"Genre filter failed or no results")
                results.append(False)
                
    except Exception as e:
        log_test("GET /api/comics?genre=Fantasy", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test search query
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/comics?q=neon", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/comics?q=neon", False, f"Expected 200, got {response.status_code}")
            results.append(False)
        else:
            data = response.json()
            comics = data.get("comics", [])
            
            # Should find "Neon Requiem" (case-insensitive)
            found_neon = any("neon" in c.get("title", "").lower() for c in comics)
            
            if found_neon:
                log_test("GET /api/comics?q=neon", True, f"Found 'Neon Requiem' in {elapsed:.2f}s")
                results.append(True)
            else:
                log_test("GET /api/comics?q=neon", False, "Did not find 'Neon Requiem'")
                results.append(False)
                
    except Exception as e:
        log_test("GET /api/comics?q=neon", False, f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def test_genres_endpoint():
    """Test 4: GET /api/genres -> returns distinct published genres"""
    log_section("TEST 4: Genres Endpoint")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/genres", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/genres", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if "genres" not in data:
            log_test("GET /api/genres", False, "Response missing 'genres' key")
            return False
        
        genres = data["genres"]
        
        # Should have multiple genres
        if len(genres) > 0:
            log_test("GET /api/genres", True, f"Returned {len(genres)} genres: {genres} in {elapsed:.2f}s")
            return True
        else:
            log_test("GET /api/genres", False, "No genres returned")
            return False
            
    except Exception as e:
        log_test("GET /api/genres", False, f"Exception: {str(e)}")
        return False

def test_comic_detail():
    """Test 5: GET /api/comics/:id -> returns comic with chapters and unlock flags"""
    log_section("TEST 5: Comic Detail with Chapters")
    
    if not test_data["comics"]:
        log_test("GET /api/comics/:id", False, "No comics available from previous test")
        return False
    
    try:
        comic_id = test_data["comics"][0]["id"]
        test_data["comic_id"] = comic_id
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/comics/{comic_id}", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/comics/:id", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if "comic" not in data or "chapters" not in data:
            log_test("GET /api/comics/:id", False, "Response missing 'comic' or 'chapters' key")
            return False
        
        chapters = data["chapters"]
        test_data["chapters"] = chapters
        
        # Find free and locked chapters
        free_chapters = [c for c in chapters if c.get("chapterNumber", 0) <= 3]
        locked_chapters = [c for c in chapters if c.get("chapterNumber", 0) >= 4]
        
        if free_chapters:
            test_data["free_chapter_id"] = free_chapters[0]["id"]
        
        if locked_chapters:
            test_data["locked_chapter_id"] = locked_chapters[0]["id"]
        
        # Verify unlock flags for unauthenticated user
        # Free chapters (1-3) should have unlocked=true
        free_unlocked = all(c.get("unlocked") == True for c in free_chapters)
        # Locked chapters (4-5) should have unlocked=false when unauthenticated
        locked_locked = all(c.get("unlocked") == False for c in locked_chapters)
        
        if free_unlocked and locked_locked:
            log_test("GET /api/comics/:id", True, f"Returned comic with {len(chapters)} chapters, correct unlock flags in {elapsed:.2f}s")
            return True
        else:
            log_test("GET /api/comics/:id", False, f"Unlock flags incorrect: free_unlocked={free_unlocked}, locked_locked={locked_locked}")
            return False
            
    except Exception as e:
        log_test("GET /api/comics/:id", False, f"Exception: {str(e)}")
        return False

def test_free_chapter_reader():
    """Test 6: GET /api/chapters/:id for FREE chapter -> returns pages"""
    log_section("TEST 6: Free Chapter Reader")
    
    if not test_data["free_chapter_id"]:
        log_test("GET /api/chapters/:id (free)", False, "No free chapter ID available")
        return False
    
    try:
        chapter_id = test_data["free_chapter_id"]
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/chapters/{chapter_id}", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/chapters/:id (free)", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        required_keys = ["chapter", "comic", "pages", "locked", "allChapters"]
        missing_keys = [k for k in required_keys if k not in data]
        
        if missing_keys:
            log_test("GET /api/chapters/:id (free)", False, f"Missing keys: {missing_keys}")
            return False
        
        pages = data["pages"]
        locked = data["locked"]
        
        # Free chapter should have locked=false and non-empty pages
        if locked == False and len(pages) > 0:
            # Verify pages are sorted by pageOrder
            page_orders = [p.get("pageOrder", 0) for p in pages]
            is_sorted = all(page_orders[i] <= page_orders[i+1] for i in range(len(page_orders)-1))
            
            if is_sorted:
                log_test("GET /api/chapters/:id (free)", True, f"Returned {len(pages)} pages, locked=false, sorted by pageOrder in {elapsed:.2f}s")
                return True
            else:
                log_test("GET /api/chapters/:id (free)", False, "Pages not sorted by pageOrder")
                return False
        else:
            log_test("GET /api/chapters/:id (free)", False, f"Expected locked=false and pages>0, got locked={locked}, pages={len(pages)}")
            return False
            
    except Exception as e:
        log_test("GET /api/chapters/:id (free)", False, f"Exception: {str(e)}")
        return False

def test_locked_chapter_reader():
    """Test 7: GET /api/chapters/:id for LOCKED chapter -> returns locked=true, empty pages"""
    log_section("TEST 7: Locked Chapter Reader (Unauthenticated)")
    
    if not test_data["locked_chapter_id"]:
        log_test("GET /api/chapters/:id (locked)", False, "No locked chapter ID available")
        return False
    
    try:
        chapter_id = test_data["locked_chapter_id"]
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/chapters/{chapter_id}", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/chapters/:id (locked)", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        pages = data.get("pages", [])
        locked = data.get("locked", False)
        
        # Locked chapter should have locked=true and empty pages when unauthenticated
        if locked == True and len(pages) == 0:
            log_test("GET /api/chapters/:id (locked)", True, f"Returned locked=true, pages=[] in {elapsed:.2f}s")
            return True
        else:
            log_test("GET /api/chapters/:id (locked)", False, f"Expected locked=true and pages=[], got locked={locked}, pages={len(pages)}")
            return False
            
    except Exception as e:
        log_test("GET /api/chapters/:id (locked)", False, f"Exception: {str(e)}")
        return False

def test_comments_list():
    """Test 8: GET /api/comments?chapterId=<id> -> returns empty list initially"""
    log_section("TEST 8: Comments List")
    
    if not test_data["free_chapter_id"]:
        log_test("GET /api/comments?chapterId=", False, "No chapter ID available")
        return False
    
    try:
        chapter_id = test_data["free_chapter_id"]
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/comments?chapterId={chapter_id}", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/comments?chapterId=", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if "comments" not in data:
            log_test("GET /api/comments?chapterId=", False, "Response missing 'comments' key")
            return False
        
        comments = data["comments"]
        
        # Initially should be empty or return 200
        log_test("GET /api/comments?chapterId=", True, f"Returned {len(comments)} comments in {elapsed:.2f}s")
        return True
            
    except Exception as e:
        log_test("GET /api/comments?chapterId=", False, f"Exception: {str(e)}")
        return False

def test_not_found_endpoints():
    """Test 9: GET /api/comics/<nonexistent> and /api/chapters/<nonexistent> -> 404"""
    log_section("TEST 9: Not Found Endpoints")
    
    results = []
    
    # Test nonexistent comic
    try:
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/comics/{fake_uuid}", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code == 404:
            log_test("GET /api/comics/<nonexistent>", True, f"Returned 404 in {elapsed:.2f}s")
            results.append(True)
        else:
            log_test("GET /api/comics/<nonexistent>", False, f"Expected 404, got {response.status_code}")
            results.append(False)
            
    except Exception as e:
        log_test("GET /api/comics/<nonexistent>", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test nonexistent chapter
    try:
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/chapters/{fake_uuid}", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code == 404:
            log_test("GET /api/chapters/<nonexistent>", True, f"Returned 404 in {elapsed:.2f}s")
            results.append(True)
        else:
            log_test("GET /api/chapters/<nonexistent>", False, f"Expected 404, got {response.status_code}")
            results.append(False)
            
    except Exception as e:
        log_test("GET /api/chapters/<nonexistent>", False, f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def test_auth_protected_endpoints():
    """Test 10-15: Auth-protected endpoints should return 401 without session"""
    log_section("TEST 10-15: Auth-Protected Endpoints (No Session)")
    
    results = []
    
    # Test POST /api/unlock
    try:
        chapter_id = test_data.get("locked_chapter_id", "test-id")
        response = requests.post(f"{BASE_URL}/unlock", json={"chapterId": chapter_id}, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/unlock (no auth)", True, "Returned 401")
            results.append(True)
        else:
            log_test("POST /api/unlock (no auth)", False, f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /api/unlock (no auth)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test POST /api/comments
    try:
        chapter_id = test_data.get("free_chapter_id", "test-id")
        response = requests.post(f"{BASE_URL}/comments", json={"chapterId": chapter_id, "content": "Test comment"}, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/comments (no auth)", True, "Returned 401")
            results.append(True)
        else:
            log_test("POST /api/comments (no auth)", False, f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /api/comments (no auth)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test POST /api/comics
    try:
        response = requests.post(f"{BASE_URL}/comics", json={"title": "Test Comic", "synopsis": "Test"}, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/comics (no auth)", True, "Returned 401")
            results.append(True)
        else:
            log_test("POST /api/comics (no auth)", False, f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /api/comics (no auth)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test POST /api/chapters
    try:
        comic_id = test_data.get("comic_id", "test-id")
        response = requests.post(f"{BASE_URL}/chapters", json={"comicId": comic_id, "title": "Test Chapter"}, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/chapters (no auth)", True, "Returned 401")
            results.append(True)
        else:
            log_test("POST /api/chapters (no auth)", False, f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /api/chapters (no auth)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test GET /api/creator/comics
    try:
        response = requests.get(f"{BASE_URL}/creator/comics", timeout=10)
        
        if response.status_code == 401:
            log_test("GET /api/creator/comics (no auth)", True, "Returned 401")
            results.append(True)
        else:
            log_test("GET /api/creator/comics (no auth)", False, f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("GET /api/creator/comics (no auth)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test POST /api/auth/role
    try:
        response = requests.post(f"{BASE_URL}/auth/role", json={"role": "CREATOR"}, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/auth/role (no auth)", True, "Returned 401")
            results.append(True)
        else:
            log_test("POST /api/auth/role (no auth)", False, f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /api/auth/role (no auth)", False, f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def test_admin_endpoints():
    """Test 16-17: Admin endpoints should return 403 without admin session"""
    log_section("TEST 16-17: Admin Endpoints (No Admin Session)")
    
    results = []
    
    # Test GET /api/admin/comics
    try:
        response = requests.get(f"{BASE_URL}/admin/comics", timeout=10)
        
        if response.status_code in [401, 403]:
            log_test("GET /api/admin/comics (no admin)", True, f"Returned {response.status_code}")
            results.append(True)
        else:
            log_test("GET /api/admin/comics (no admin)", False, f"Expected 401/403, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("GET /api/admin/comics (no admin)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test POST /api/admin/moderate
    try:
        comic_id = test_data.get("comic_id", "test-id")
        response = requests.post(f"{BASE_URL}/admin/moderate", json={"comicId": comic_id, "status": "PUBLISHED"}, timeout=10)
        
        if response.status_code in [401, 403]:
            log_test("POST /api/admin/moderate (no admin)", True, f"Returned {response.status_code}")
            results.append(True)
        else:
            log_test("POST /api/admin/moderate (no admin)", False, f"Expected 401/403, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /api/admin/moderate (no admin)", False, f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def test_auth_basics():
    """Test 18-19: Auth basics - /api/auth/me and invalid session handling"""
    log_section("TEST 18-19: Auth Basics")
    
    results = []
    
    # Test GET /api/auth/me (unauthenticated)
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            log_test("GET /api/auth/me (no auth)", False, f"Expected 200, got {response.status_code}")
            results.append(False)
        else:
            data = response.json()
            
            if "user" in data and data["user"] is None:
                log_test("GET /api/auth/me (no auth)", True, f"Returned {{user: null}} in {elapsed:.2f}s")
                results.append(True)
            else:
                log_test("GET /api/auth/me (no auth)", False, f"Expected {{user: null}}, got {data}")
                results.append(False)
    except Exception as e:
        log_test("GET /api/auth/me (no auth)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test POST /api/auth/session with invalid session_id
    try:
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/auth/session", json={"session_id": "invalid_dummy"}, timeout=10)
        elapsed = time.time() - start_time
        
        # Should fail gracefully with 401, not crash with 500
        if response.status_code == 401:
            log_test("POST /api/auth/session (invalid)", True, f"Returned 401 (graceful failure) in {elapsed:.2f}s")
            results.append(True)
        elif response.status_code == 500:
            log_test("POST /api/auth/session (invalid)", False, f"Returned 500 (crash) - should handle gracefully")
            results.append(False)
        else:
            log_test("POST /api/auth/session (invalid)", False, f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /api/auth/session (invalid)", False, f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def verify_seed_data():
    """Verify seed data integrity"""
    log_section("SEED DATA VERIFICATION")
    
    results = []
    
    try:
        # Get all comics
        response = requests.get(f"{BASE_URL}/comics", timeout=10)
        comics = response.json().get("comics", [])
        
        # Should have 5 PUBLISHED comics
        if len(comics) == 5:
            log_test("Seed Data: Comics Count", True, "5 PUBLISHED comics")
            results.append(True)
        else:
            log_test("Seed Data: Comics Count", False, f"Expected 5, got {len(comics)}")
            results.append(False)
        
        # Check first comic's chapters
        if comics:
            comic_id = comics[0]["id"]
            response = requests.get(f"{BASE_URL}/comics/{comic_id}", timeout=10)
            data = response.json()
            chapters = data.get("chapters", [])
            
            # Should have 5 chapters per comic
            if len(chapters) == 5:
                log_test("Seed Data: Chapters Count", True, "5 chapters per comic")
                results.append(True)
            else:
                log_test("Seed Data: Chapters Count", False, f"Expected 5, got {len(chapters)}")
                results.append(False)
            
            # Verify lock flags
            free_count = sum(1 for c in chapters if c.get("chapterNumber", 0) <= 3 and not c.get("isLocked", True))
            locked_count = sum(1 for c in chapters if c.get("chapterNumber", 0) >= 4 and c.get("isLocked", False))
            
            if free_count == 3 and locked_count == 2:
                log_test("Seed Data: Lock Flags", True, "Chapters 1-3 free, 4-5 locked")
                results.append(True)
            else:
                log_test("Seed Data: Lock Flags", False, f"Free: {free_count}, Locked: {locked_count}")
                results.append(False)
            
            # Check pages for a free chapter
            if chapters:
                free_chapter = next((c for c in chapters if c.get("chapterNumber", 0) <= 3), None)
                if free_chapter:
                    response = requests.get(f"{BASE_URL}/chapters/{free_chapter['id']}", timeout=10)
                    data = response.json()
                    pages = data.get("pages", [])
                    
                    if len(pages) > 0:
                        log_test("Seed Data: Pages", True, f"Chapter has {len(pages)} pages")
                        results.append(True)
                    else:
                        log_test("Seed Data: Pages", False, "No pages found")
                        results.append(False)
        
    except Exception as e:
        log_test("Seed Data Verification", False, f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def main():
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}KomikAI Backend API Test Suite{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")
    
    all_results = []
    
    # Run all tests in order
    all_results.append(("Public Comics List", test_public_comics_list()))
    all_results.append(("Comics Sorting", test_comics_sorting()))
    all_results.append(("Comics Filtering", test_comics_filtering()))
    all_results.append(("Genres Endpoint", test_genres_endpoint()))
    all_results.append(("Comic Detail", test_comic_detail()))
    all_results.append(("Free Chapter Reader", test_free_chapter_reader()))
    all_results.append(("Locked Chapter Reader", test_locked_chapter_reader()))
    all_results.append(("Comments List", test_comments_list()))
    all_results.append(("Not Found Endpoints", test_not_found_endpoints()))
    all_results.append(("Auth-Protected Endpoints", test_auth_protected_endpoints()))
    all_results.append(("Admin Endpoints", test_admin_endpoints()))
    all_results.append(("Auth Basics", test_auth_basics()))
    all_results.append(("Seed Data Verification", verify_seed_data()))
    
    # Summary
    log_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in all_results if result)
    total = len(all_results)
    
    print(f"\n{Colors.BLUE}Results:{Colors.END}")
    for test_name, result in all_results:
        status = f"{Colors.GREEN}✅ PASS{Colors.END}" if result else f"{Colors.RED}❌ FAIL{Colors.END}"
        print(f"  {status} | {test_name}")
    
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    if passed == total:
        print(f"{Colors.GREEN}ALL TESTS PASSED: {passed}/{total}{Colors.END}")
    else:
        print(f"{Colors.YELLOW}TESTS PASSED: {passed}/{total}{Colors.END}")
        print(f"{Colors.RED}TESTS FAILED: {total - passed}/{total}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
