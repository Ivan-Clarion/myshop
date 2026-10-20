# Stitch MCP Designed Screens & Design System Specification

## 1. Project Metadata
* **Stitch Project ID:** `10823834258682928828`
* **Resource Path:** `projects/10823834258682928828`
* **Project Title:** Minimalist Light Design System
* **Design Concept:** Soft Neo-Fintech Canvas
* **Target Device:** Desktop (`DESKTOP`)
* **Primary Color Scheme:** Light Mode (`LIGHT`)

---

## 2. Core Design Tokens

### Color Palette
* **Primary (Vermilion Energy):**
  * Base: `#D63C1E`
  * Deep: `#B22204`
  * Bright: `#E64A19`
* **Secondary / Typography Anchor:** `#1A232F` (Deep slate navy)
* **Surfaces & Canvas:**
  * App Canvas: `#F9F9F9` / `#F5F5F5`
  * Floating Cards: `#FFFFFF` (Pure white, borderless)
  * Subtle Borders: `#EAEAEA`
* **Text & Contrast:**
  * Primary Text: `#1A1A1A`
  * Secondary / Labels: `#757575`
* **Semantics:**
  * Success: `#00A651`
  * Warning: `#FFC107`
  * Error: `#D32F2F`

### Shape & Elevation
* **Pill Geometry (`rounded-full` / `9999px`):** Buttons, inputs, search chips, status tags, tabs.
* **Continuous Card Curvature:** 24px–32px outer corner radius (`rounded-3xl` / `rounded-2xl`).
* **Level 1 Ambient Shadow:** `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)`.
* **Zero Harsh Borders:** Rely on luminance shifts and soft ambient shadows.

---

## 3. Screen Registry

| Screen Title | Screen ID | Dimensions | Role / Description |
| :--- | :--- | :--- | :--- |
| **MyShop Admin Portal — Dashboard** | `860cd86c06b04b20946fcf4b774d3658` | 2560 × 3788 | Central control tower, GMV metrics, active terminals, overview telemetry. |
| **MyShop Admin Portal — User Management** | `030e9d11690444ae9b758ac5043c6bd8` | 2560 × 3180 | Merchant operators, staff roles, account status, security sessions. |
| **MyShop Admin Portal — Tier Management** | `70e103df77cc4c64bc46f62d13a48daa` | 2560 × 3296 | Subscription tiers (Free, Micro, Small, Medium), limits, manual overrides. |
| **MyShop Admin Portal — System Health** | `a3d97f7a7bc34f3297883e9af7f14409` | 2560 × 3992 | Terminal concurrency, uptime, sync status, database health telemetry. |
| **MyShop Admin Portal — Sales** | `fb9dc7d7e1f84b11814333c730898645` | 2560 × 2048 | Transaction volumes, provincial GMV distribution, invoice tracking. |
| **MyShop Admin Portal — Revenue** | `c3d865b03cec4b9a805993f2090f74c4` | 2560 × 2048 | Platform subscription revenue, MRR/ARR breakdown, partner deals. |
| **MyShop Admin Portal — Reports** | `b674dd4f53f64098b46636e22bbb8305` | 2560 × 2836 | Exportable analytics, CSV generation (`papaparse`), scheduled reports. |
| **MyShop Admin Portal — Login** | `56201b55e8f8400b8221371e17ad8686` | 2560 × 2048 | Minimalist operator login screen with single-session enforcement note. |
| **MyShop Admin Portal — Testimonials** | `f0f5404eb0fd46a5bef9e90fec340908` | 2560 × 3768 | Merchant feedback, operator case studies, NPS ratings. |
| **MyShop — Landing Page** | `12199c7a12b144d2aa924cbbda15b374` | 2560 × 3658 | Public-facing merchant acquisition and product overview page. |

---

## 4. Stitch Screen Resource References

### 1. Dashboard
* **Screen ID:** `860cd86c06b04b20946fcf4b774d3658`
* **Screenshot URL:** [View Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1UDxNpKbRm2eHd54-Y4qf_GkzDqaI1MfYOBFzi-BGt2OtfLYW1FXSmAW4j1atjUu-3ViolZ1xLxEDYMumDBwz4qsB6-KTTVtYvuyEjCyZPl7cnBvZdYvHF2B6GUU2k2JbTg3zNSInxmcGtL9KspjRcy9mofH8HpGacjqer8e90ehtJmYRvmWHcSPeDjoEpH8HPZSSDy68UIkSgFivdCAKlz_F9ugaFlwJNW4yrJE3qTuZmrlOXk_9xH6ZnW)
* **HTML Template File ID:** `1450463580980567296`

### 2. User Management
* **Screen ID:** `030e9d11690444ae9b758ac5043c6bd8`
* **Screenshot URL:** [View Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Ubpj43qvcs4cEunlqq9bCor1bE7rBZmJ9g3PX1YVR9DLX4oVEf-PyBMg9KPAOSD1icGNMXABAgT6JvY-wOwd1LkfXqpcsGuXMdt7G-K9DDWVHgiNUq0kPDGmpBqhvztAZoht8UKiZy3XCeBUDRp-_7gT8TK4EirQL0j8KJPtNEBABR7MKbXJzGxz-L7mS8pdiFBIC2MndwYf4fOeLwOV3hhJAj1dwO6WjCFXRB1G2wQgI3cuQsBBArvXOR)
* **HTML Template File ID:** `6333565705361701950`

### 3. Tier Management
* **Screen ID:** `70e103df77cc4c64bc46f62d13a48daa`
* **Screenshot URL:** [View Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WUlXvvB_u-q5dFDN-S2HVLiFJU688OIe21e3pV58KXlRU90Cvb_9C2iKbP7PRbVxZUcJLlwMwZrw0BXx_Q2pw4pEqVk9s5dyp7jv3oyCoiUGm-pJWggqo8_IcAaG4RbLLmc1lN8OKOjUJhXmgjUE-llAbMnhj1eTy_yE6816uhp2F2FbmtEPCYUHNYqSPW4EklzVHEoChMqK4qj53s5h5wCaNC8I78ePYBbWpymDdy0-EwVmkzTJT8xcOA)
* **HTML Template File ID:** `352457676499580753`

### 4. System Health
* **Screen ID:** `a3d97f7a7bc34f3297883e9af7f14409`
* **Screenshot URL:** [View Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1X5pJX0eC7_VvZOcHrk4wKnANcAh_dcy5-jW2O6hpoWkigpyBoQNTerL9UI6XBZummalime0UGdHMlqY6hri0iJf3Iw6upP7GaEY0B5oWUIReO8kd9ZSlSDmVL9-CZ9K2ZcSgrwu0Ar4N8FtD2KnPENL1dMkkPMvBj3tgrT5T9HnyrXd8UXDmGnADD2dixb7D2kzv2D9zCgPackBZSVyGCeHPnH94pTnHF71t9qoXizCvSyNHVv0nB6shg)
* **HTML Template File ID:** `10850396037233018481`

### 5. Sales
* **Screen ID:** `fb9dc7d7e1f84b11814333c730898645`
* **Screenshot URL:** [View Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1XCusCUz_S6Ox0SkYkc6OoDeH_IkMMvX7FMKoOiZ-XwEgjJgywkMnmziCbqt9QhM4DpCuo-jw4JruoMpfzfEcDxsFSFY-Ta0cS4rw9UVYf7f94UVYDHjE7AbkUF8UCaSjIIw-usNUlulLeZEiY01mwXzOR_LU8Bnvy3FGPH9UdFvU0gLxzvdpz4hpyQfPzHeq91SiAheTv_gMPjeSgVuEvClgXN4J_KN85-BxaH4h_ts1B3fJ2ByihWJAfY)
* **HTML Template File ID:** `17604413797009462707`

### 6. Revenue
* **Screen ID:** `c3d865b03cec4b9a805993f2090f74c4`
* **Screenshot URL:** [View Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1W2pOXfn52lLy-hguEl7gyWuHVxcrh6c3_VwOF065r9iytxTnxP7HM0AnwwqqwZ0LKN-87klFrdE6jwzjqCwFB_mymjBo8Rsm44whN64_yoYwGR30bNaXTeSWnPq1eJPzolZRl66cNQVWFBr44Em70mmgIETuyVXl2ZnT8lnVyoPYPAfQVwjJkvaCXyPvlkCfotXCtwX9IzJPsLANbDwVKlkMW1KNFVvHMqqLCh7yjoAfKv8qbz_nm6XRh6)
* **HTML Template File ID:** `4634761332419147662`

### 7. Reports
* **Screen ID:** `b674dd4f53f64098b46636e22bbb8305`
* **Screenshot URL:** [View Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Vdnb3nA_1LxWr9CT3rFk3yYL0qpB2T0bsXrW-9ueztRONsZpQAkdfVsd5WcmUwgzKGHrGAgTjnOiSyNjR6lXoMQXNnD5gl90Y-dfqfMpRu0q-_JAl20aaGN1lrpqKFOBuKnRhdAMpypjimD_2u-UovgvlUyi6qpl5lZVbp_KcycdRBFRMuracwH-FXS8nP4M9jm_fMhVjbqZgz9UWJTLpPPRMIbGHxkrjYYXAdKdOSou8UONqATD2dNFB4)
* **HTML Template File ID:** `11277205194389651609`

### 8. Login
* **Screen ID:** `56201b55e8f8400b8221371e17ad8686`
* **Screenshot URL:** [View Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1XddJXdtVUTqFUcltXHSzt6KW61bNpGff1NMj1UrLOYrR3YgPPjaExVMi46u9dca8SqOd3z5uPSrCuIRPo1PMujPhtmCqQiTbJfGrF0G-owjHAlD-9axKhLhi9fpL3_xnMes9OVEvFhxViK1_1BnymSCirqxFZEdC1HyOBaZmNgYG1mtsKuj6_AK3DMBZ5nsZQsTgz8f4g2f7vhva46EqpULzY64u4OUX_SOzBpD9sR-JuGdLUM2Ys8t-Oo)
* **HTML Template File ID:** `16215968367738387933`

---

## 5. Associated Assets
* **Emblem Logo (`emblem_logo_2.0.png`):** Screen ID `11481639581189360285` (1024 × 1024)
* **Typology Logo (`typology_logo_2.0.png`):** Screen ID `11481639581189359603` (1024 × 1024)
* **Design System Specification (`DESIGN (1).md`):** Screen ID `3772208474004705316`
