# Client-Side Flow — AirBnB Clone

> **Client** = ang nagre-rent ng bahay/house

---

## 1. Homepage & Room Browsing

### 1.1 Homepage
```
[Homepage]
  ├─ Hero Section: Search bar (Destination)
  │   └─ Search triggers → /rooms?location=xxx
  ├─ Categories/Popular Destinations (clickable cards)
  ├─ Featured Rooms (carousel/grid)
  ├─ "Nearby" section (geolocation-based)
  └─ Footer: About, Contact, Terms, Privacy
```

### 1.2 Search & Filter
```
[Search Results Page] — GET /api/rooms?location=&checkIn=&checkOut=&guests=
  ├─ Filters (left sidebar or top bar):
  │   ├─ Location (text input + autocomplete)
  │   ├─ Check-in / Check-out (date picker)
  │   ├─ Guests (adults, children, infants, pets)
  │   ├─ Price Range (slider: min-max)
  │   ├─ Room Type (entire place, private room, shared room)
  │   ├─ Amenities (WiFi, Kitchen, AC, Pool, Parking...)
  │   ├─ Instant Book toggle
  │   ├─ Superhost toggle
  │   └─ More Filters (bedrooms, beds, bathrooms, property type)
  ├─ Sort: Recommended, Price (low-high), Price (high-low), Rating, Distance
  ├─ Results:
  │   ├─ Map View (left/right split or full)
  │   └─ List View (card grid)
  │       └─ Each Card: Image, Title, Location, Price/night, Rating, ★ Superhost badge
  ├─ Pagination / Infinite Scroll
  └─ No Results → "Try expanding your filters" + suggestions
```

### 1.3 Room Detail
```
[Room Detail Page] — GET /api/rooms/:id
  ├─ Header:
  │   ├─ Photo Gallery (main image + thumbnails grid)
  │   ├─ Share button
  │   └─ Save/Wishlist (heart icon)
  ├─ Body:
  │   ├─ Title, Location, Rating (★), Superhost badge
  │   ├─ Host Info: Avatar, Name, "Joined in YYYY"
  │   ├─ Room Highlights: Entire place · X guests · X bedrooms · X beds · X baths
  │   ├─ Description
  │   ├─ Amenities list (with icons)
  │   └─ Reviews section:
  │       ├─ Average rating breakdown (cleanliness, accuracy, communication, location, check-in, value)
  │       └─ Individual reviews (avatar, name, date, text)
  ├─ Booking Card (sticky sidebar or bottom sheet on mobile):
  │   ├─ Price: ₱XXX / night
  │   ├─ Date Picker (check-in / check-out)
  │   ├─ Guests dropdown
  │   ├─ Price Breakdown:
  │   │   ├─ ₱XXX x N nights
  │   │   ├─ Cleaning fee
  │   │   ├─ Service fee
  │   │   └─ Total
  │   └─ [Book Now] button → redirect to Booking/Checkout
  └─ Near the bottom: Similar Rooms / Recommended section

```
  ### 1.4 Room Comparison

[Compare Rooms] — triggered from Search Results Page

  ├─ User selects up to 3 rooms from search results
  ├─ Each selected room is added to comparison list
  ├─ Compare Button becomes active

  ├─ Comparison View:
  │   ├─ Room Image + Title
  │   ├─ Price per night
  │   ├─ Location
  │   ├─ Capacity (guests allowed)
  │   ├─ Amenities (WiFi, Kitchen, AC, Parking, Pool, etc.)
  │   ├─ Ratings (★ average score)
  │   ├─ Cancellation policy

  ├─ Highlight Differences:
  │   ├─ Cheapest price highlighted
  │   ├─ Highest rated highlighted
  │   ├─ Most amenities highlighted

  ├─ Actions:
  │   ├─ View Full Details → Room Detail Page
  │   ├─ Remove from comparison
  │   └─ Select preferred room

  └─ Result:
      └─ User proceeds to chosen Room Detail Page or Booking flow


---

## 2. Booking & Checkout Flow

### 2.1 Booking / Checkout Page
```
[Checkout Page] — Requires authentication
  ├─ Step 1: Confirm Booking Details
  │   ├─ Room summary (photo, name, host)
  │   ├─ Check-in / Check-out dates
  │   ├─ Guests
  │   ├─ Price breakdown (final, all fees included)
  │   └─ Cancellation policy (read-only)
  ├─ Step 2: Guest Information
  │   ├─ Full Name (pre-filled from profile)
  │   ├─ Email (pre-filled)
  │   ├─ Phone (pre-filled)
  │   └─ Special requests / Message to host (textarea)
  ├─ Step 3: Payment
  │   ├─ Payment method selection:
  │   │   ├─ Credit/Debit Card
  │   │   ├─ GCash / PayMaya
  │   │   ├─ Bank Transfer
  │   │   └─ Saved cards (if any)
  │   ├─ Billing Address
  │   ├─ Promo Code / Coupon (optional)
  │   └─ [Confirm & Pay] button
  ├─ Step 4: Confirmation
  │   ├─ "Booking Confirmed!" animation/message
  │   ├─ Booking Reference Number
  │   ├─ Booking details summary
  │   ├─ Host contact info
  │   ├─ "Add to Calendar" buttons (Google, iCal)
  │   └─ [Go to My Bookings] button
  └─ Edge Cases:
      ├─ Booking conflict → "These dates are no longer available"
      ├─ Payment failed → "Payment failed. Try another method."
      └─ Session expired → Redirect to homepage
```

### 2.2 Booking States
```
Booking Status Flow:

Pending → Confirmed → In Progress → Completed → Reviewed
                  ↘ Cancelled (by client)
                  ↘ Cancelled (by host)
                  ↘ Declined (by host)

- Pending:      Awaiting host confirmation (if not instant book)
- Confirmed:    Host accepted / instant book success
- In Progress:  Current date is within check-in/check-out range
- Completed:    Check-out date passed
- Reviewed:     Client left a review
- Cancelled:    By client or host (with refund rules)
```

### 2.3 Cancellation Flow
```
[My Bookings] → Select Booking → [Cancel Booking]
  ├─ Show cancellation policy & refund amount
  ├─ Select reason (dropdown):
  │   ├─ Change of plans
  │   ├─ Found better option
  │   ├─ Emergency
  │   └─ Other (text)
  ├─ [Confirm Cancellation] → POST /api/bookings/:id/cancel
  │   ├─ Success → Show refund details + timeline
  │   └─ Error → "Cannot cancel, check-in is today"
  └─ Refund logic (based on policy):
      ├─ Flexible: Full refund up to 24hrs before
      ├─ Moderate: Full refund up to 5 days before
      └─ Strict: 50% refund up to 1 week before
```

---

## 3. User Dashboard / Profile

### 3.1 Profile Management
```
[Profile Page] — GET /api/profile
  ├─ Edit Profile:
  │   ├─ Avatar (upload / change)
  │   ├─ Full Name
  │   ├─ Email (read-only, change requires verification)
  │   ├─ Phone Number
  │   ├─ Language preference
  │   ├─ Currency preference (PHP, USD, etc.)
  │   └─ Bio / About me
  ├─ Change Password:
  │   ├─ Current Password
  │   ├─ New Password
  │   └─ Confirm New Password
  └─ Delete Account → Confirmation modal → POST /api/profile/delete
```

### 3.2 My Bookings
```
[My Bookings Page] — GET /api/bookings
  ├─ Tabs:
  │   ├─ Upcoming (future check-in)
  │   ├─ Active (currently staying)
  │   ├─ Completed (past stays)
  │   └─ Cancelled
  ├─ Each Booking Card:
  │   ├─ Room Image
  │   ├─ Room Title + Location
  │   ├─ Dates: Check-in → Check-out
  │   ├─ Status badge (Confirmed, In Progress, Completed, Cancelled)
  │   ├─ Total Price
  │   ├─ [View Details] → Booking detail page
  │   ├─ [Cancel] (if cancellable)
  │   └─ [Leave Review] (if completed & not yet reviewed)
  └─ Empty state: "No bookings yet. Start exploring!"
```

### 3.3 Booking Detail
```
[Booking Detail Page] — GET /api/bookings/:id
  ├─ Booking Reference #
  ├─ Status (with timeline)
  ├─ Room Details (link to room page)
  ├─ Host Info + Contact button
  ├─ Dates & Guests
  ├─ Price Breakdown
  ├─ Cancellation Policy
  ├─ Payment Info (method, date paid)
  └─ Actions: [Cancel], [Message Host], [Get Directions], [Add to Calendar]
```

### 3.4 Wishlist / Saved
```
[Wishlist Page] — GET /api/wishlists
  ├─ Create New Wishlist (e.g., "Dream Vacations", "Weekend Trips")
  ├─ Each Wishlist:
  │   ├─ Name
  │   ├─ Room count
  │   ├─ Visibility (Public / Private)
  │   └─ [View] → List of saved rooms
  └─ Quick Save: Heart icon on room cards
```

### 3.5 Reviews Given
```
[My Reviews Page] — GET /api/reviews
  ├─ Each review card:
  │   ├─ Room photo + name
  │   ├─ Rating (stars)
  │   ├─ Review text
  │   ├─ Date
  │   └─ [Edit] / [Delete]
  └── Empty state: "No reviews yet"

```
### 3.6 Rebook Previous Stay

[My Bookings] → Completed Tab
  ├─ Select previous booking
  ├─ Click [Rebook]
  ├─ System loads previous room details
  ├─ User selects new dates
  ├─ Availability check
  ├─ Confirm booking
  └─ Redirect to Checkout Page

---

## 4. Reviews & Ratings Flow

### 4.1 Leave a Review
```
[Leave Review] — after booking is Completed
  ├─ Step 1: Overall Rating (1-5 stars)
  ├─ Step 2: Detailed Ratings:
  │   ├─ Cleanliness
  │   ├─ Accuracy
  │   ├─ Communication
  │   ├─ Location
  │   ├─ Check-in
  │   └─ Value
  ├─ Step 3: Written Review (min 10 chars, optional photos)
  ├─ Step 4: Visibility — "Your review will be public"
  └─ Submit → POST /api/reviews
      ├─ Success → Booking status becomes "Reviewed"
      └─ Error → Auto-save draft (don't lose review text)
```

### 4.2 View Reviews
```
[Room Detail Page] → Reviews Section
  ├─ Average Rating (big number)
  ├─ Rating distribution bar chart (5★ → 1★)
  ├─ Sort: Most recent, Highest rating, Lowest rating
  ├─ Filter: With photos
  └─ Review cards: Avatar, Name, Date, Rating, Text, Photos
```

---

## 5. Payment Flow

### 5.1 Payment Methods
```
[Payment Methods Page]
  ├─ Saved Cards:
  │   ├─ Card type (Visa, MC) + last 4 digits + expiry
  │   ├─ Default badge
  │   └─ [Delete]
  ├─ Add Payment Method:
  │   ├─ Credit/Debit Card (card number, expiry, CVV, cardholder name)
  │   ├─ GCash (phone number)
  │   └─ MAya (phone number)
  └─ Billing Address (default)
```

### 5.2 Payment Processing (during booking)
```
[Payment Processing]
  ├─ Show loading state: "Processing payment..."
  ├─ Success → Booking Confirmed page
  ├─ Failed:
  │   ├─ Insufficient funds → "Please use another card"
  │   ├─ Card declined → "Try another payment method"
  │   └─ Timeout → "Payment timeout. Retry?"
  └─ Double Charge Protection: Idempotency key sa backend
```

---

## 6. Notifications

```
[Notification Center] — GET /api/notifications
  ├─ Notification Types:
  │   ├─ Booking Confirmed
  │   ├─ Booking Cancelled (by host)
  │   ├─ Host sent a message
  │   ├─ Reminder: Check-in tomorrow
  │   ├─ Reminder: Leave a review
  │   ├─ Special offers / Promos
  │   └─ Payment successful / refund processed
  ├─ Unread badge (nav bar)
  ├─ Mark as Read / Mark All as Read
  └─ Click → Navigate to relevant page

```
### 6.1 Availability Notification

[Room Detail Page] — when selected dates are unavailable

  ├─ System detects that chosen dates are fully booked
  ├─ Show message: "These dates are not available"

  ├─ User Option:
  │   ├─ [Notify Me When Available] button


  ├─ Monitoring:
  │   ├─ System checks room availability updates
  │   ├─ If dates become available:
  │   │   ├─ Trigger notification event

  ├─ Notification Sent:
  │   ├─ In-app notification
  │   ├─ (Optional) Email notification
  │   ├─ Message: "Good news! Your selected room is now available."

  └─ Action After Notification:
      ├─ User clicks notification
      ├─ Redirect to Room Detail Page
      └─ User proceeds to booking flow
---

## 7. Mobile Responsiveness

```
Breakpoints:
  ├─ Desktop (> 1024px): Full layout, sticky booking sidebar
  ├─ Tablet (768px - 1024px): Grid adjusts, sidebar becomes bottom bar
  └─ Mobile (< 768px):
      ├─ Bottom navigation bar (Home, Search, Bookings, Profile)
      ├─ Booking card becomes sticky bottom sheet
      ├─ Hamburger menu for filters
      └─ Swipeable photo gallery
```

---

## 8. Error & Edge Cases

```
Global Error Handling:
  ├─ 401 → Redirect to homepage
  ├─ 403 → "You don't have permission"
  ├─ 404 → "Page not found"
  ├─ 500 → "Something went wrong. Try again."
  └─ Network Error → "No internet connection" + Retry button

Empty States:
  ├─ No search results → Suggestions + "Try different filters"
  ├─ No bookings → "Start exploring rooms"
  ├─ No reviews → "Be the first to review"
  └─ No notifications → "You're all caught up!"

Loading States:
  ├─ Skeleton loaders for room cards
  ├─ Spinner for booking/payment processing
  └─ Progressive image loading (blur placeholder → full image)

Form Validation:
  ├─ Inline validation (on blur)
  ├─ Submit validation (all fields)
  └─ Real-time password strength indicator
```

---

## 9. API Endpoints Summary

```
Rooms:
  GET    /api/rooms                    (with query params for search/filter)
  GET    /api/rooms/:id
  GET    /api/rooms/:id/reviews
  GET    /api/rooms/featured

Bookings:
  POST   /api/bookings                 (create booking)
  GET    /api/bookings                 (my bookings)
  GET    /api/bookings/:id
  POST   /api/bookings/:id/cancel
  POST   /api/bookings/:id/pay

Reviews:
  POST   /api/reviews
  GET    /api/reviews                  (my reviews)
  PUT    /api/reviews/:id
  DELETE /api/reviews/:id

Profile:
  GET    /api/profile
  PUT    /api/profile
  POST   /api/profile/change-password
  DELETE /api/profile/delete

Wishlist:
  GET    /api/wishlists
  POST   /api/wishlists
  GET    /api/wishlists/:id
  POST   /api/wishlists/:id/rooms     (add room)
  DELETE /api/wishlists/:id/rooms/:roomId

Payments:
  GET    /api/payment-methods
  POST   /api/payment-methods
  DELETE /api/payment-methods/:id

Notifications:
  GET    /api/notifications
  PUT    /api/notifications/:id/read
  PUT    /api/notifications/read-all
```

---

