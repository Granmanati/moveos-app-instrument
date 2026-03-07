# MOVE OS — UI Rules Specification
Version: 1.0
Status: Canonical UI Layout Rules

This document defines the structural rules of the MOVE OS interface.

All UI implementations must follow these rules.

These rules prevent visual chaos, spacing inconsistency, and component duplication.

---

# 1. Global UI Philosophy

MOVE OS UI must feel:

• engineered  
• calm  
• structured  
• technical  

Never:

• decorative  
• gamified  
• fitness-app style  
• influencer aesthetics

The interface must resemble **a system console for human adaptation**.

---

# 2. Layout Grid

MOVE OS uses a strict **8px grid system**.

Spacing scale:

8  
16  
24  
32  
48  
64  

Example:


margin-top: 24px
padding: 16px
gap: 12px


No arbitrary spacing values are allowed.

---

# 3. Screen Layout

Every screen must follow the same base layout.


HEADER
CONTENT
BOTTOM NAV


Rules:

Header → fixed height  
Content → scrollable  
BottomNav → fixed

---

# 4. Header Rules

All screens must use the **SystemHeader component**.

Structure:


[ SYMBOL ] MOVE OS
SCREEN TITLE
SUBLABEL


Example:


MOVE OS
MISSION
Execute adaptation protocol


Rules:

• title font-size: 18–20px  
• subtitle font-size: 12–14px  
• spacing below header: 24px  
• header must never contain large empty space  

---

# 5. Bottom Navigation

MOVE OS navigation contains exactly **5 tabs**.


Home
Mission
Explore
Progress
System


Icons must be:

• minimal
• line based
• 24px size

Rules:

Active tab → blue  
Inactive → gray  

---

# 6. Card System

MOVE OS uses **3 levels of cards**.

---

## Level 1 — System Cards

Used for:

• Active Mission  
• Subscription  
• System State  

Properties:


padding: 20px
border-radius: 16px
background: #121821


---

## Level 2 — Execution Cards

Used in Mission screen.

Properties:


padding: 16px
border-radius: 14px
background: #141B26


---

## Level 3 — Metrics Cards

Used in Progress or Home.

Properties:


padding: 12px
border-radius: 12px
background: #141B26


---

# 7. Typography Hierarchy

MOVE OS typography must follow strict levels.

---

## Level 1 — Screen Title

Font:

Inter SemiBold

Size:


20px


Example:


MISSION


---

## Level 2 — Section Titles

Size:


16px


Example:


SYSTEM METRICS


---

## Level 3 — Card Titles

Size:


14px


Example:


TEMPO SQUAT


---

## Level 4 — Technical Data

Font:

IBM Plex Mono

Size:


13px


Example:


6–8 reps
75s rest


---

# 8. Exercise Block Rules

Exercise blocks appear in Mission.

Structure:


Exercise Name
Execution Data
CTA Button


Example:


TEMPO SQUAT

3 sets
6–8 reps
75s rest

[ START ]


Rules:

• exercise name must be prominent  
• execution data must use mono font  
• video is optional and small  

---

# 9. Explore Feed Layout

Explore uses **vertical content cards**.

Inspired by:

• TikTok
• Reels
• educational feeds

Card structure:


Video
Title
Short description


Rules:

Video occupies top 70% of card.

Scrolling must feel fluid.

---

# 10. Progress Screen Layout

Progress uses **metric blocks**.

Example layout:


Return Consistency
Session Volume
Pain Trend
Load Balance


Each metric uses:

• chart
• label
• timeframe

No social metrics allowed.

---

# 11. System Screen Layout

System replaces Profile.

Structure:


Identity
Subscription
System Metrics
Settings
Version
Sign Out


Rules:

Settings must be displayed as **rows**, not cards.

Example:


Personal Data >
Notifications >
Privacy >
Language >


---

# 12. Buttons

MOVE OS buttons must be restrained.

Primary button:


background: #2D7CFF
border-radius: 12px
height: 44px


Secondary button:


border: 1px solid #2D7CFF
background: transparent


Danger button:


background: #F05A67


---

# 13. Motion Rules

Animations must feel subtle.

Durations:


120ms
200ms
400ms


Examples:

Progress bar growth  
Exercise completion  
Timeline update  

Avoid:

• bounce animations  
• overshoot  
• flashy transitions  

---

# 14. Empty States

When no data exists, show system state message.

Example:


No sessions yet
Your system will activate after your first mission


Never show blank screens.

---

# 15. Performance Rules

Avoid heavy loaders.

Use:

• skeleton UI
• progressive rendering

Never block entire screen while fetching data.

---

# End of UI Rules