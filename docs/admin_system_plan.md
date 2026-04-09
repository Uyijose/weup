# Admin System Plan

## Role Structure Recommendation

Add a column to users table:

``` sql
is_admin boolean default false
```

Scalable option:

``` sql
role text default 'user'
```

Possible roles: - 
user 
creator 
moderator (not yet, ignore)
admin 
super_admin (not yet, ignore)

------------------------------------------------------------------------

# Admin Capabilities

## Account Control

1.  Ban / suspend users temporarily\
2.  Permanently delete user accounts\
3.  Restore suspended accounts\
4.  Change user roles\
5.  Verify creators (add badge)\
6.  Reset passwords manually\
7.  View full user activity logs

## Video Control

8.  Delete any video\
9.  Feature videos on homepage\
10. Shadow-ban videos\
11. Remove monetization\
12. Age-restrict videos\
13. Mark videos as sensitive\
14. Edit video metadata

## Comment & Community Control

15. Lock comments on a video\
16. Pin a comment\
17. Globally disable comments on a user\
18. Add official admin tag to comments\
19. Create system announcement comments\
20. Disable comment replies

## Report & Moderation

21. View report dashboard\
22. See report trends\
23. Auto-suspend after X reports\
24. Add moderation notes\
25. Assign reports to moderators\
26. Mark reports resolved

## Payment & Monetization

27. Approve payout requests\
28. Reject payout requests\
29. Adjust creator earnings\
30. Freeze earnings\
31. View transaction history\
32. Set platform commission\
33. Issue refunds

## Ads & System Control

34. Create global ad comments\
35. Insert sponsored videos\
36. Promote creators\
37. Create site-wide announcements\
38. Send push notifications\
39. Send email broadcasts

## Analytics Access

40. View full platform analytics\
41. See total revenue\
42. View active users\
43. Monitor growth trends\
44. See creator rankings

## Security Control

45. View login attempts\
46. Block IP addresses\
47. Enable 2FA\
48. Force logout sessions\
49. Track suspicious behavior

------------------------------------------------------------------------

# Recommended Admin Structure

/admin\
- dashboard.jsx\
- users.jsx\
- reports.jsx\
- payments.jsx\
- ads.jsx\
- analytics.jsx

------------------------------------------------------------------------


Profile Page (Normal UI)

Admin Panel Button

Click → Admin Dashboard Page

# Admin Logs Table (Recommended)

Store admin actions:

``` sql
admin_id
action
target_id
timestamp
```

------------------------------------------------------------------------

# Security Rule

Always validate admin role in backend:

``` javascript
if (!user.is_admin) {
  return res.status(403).json({ error: "Unauthorized" })
}
```


🎯 Database Tables You Will Eventually Need

users

videos this should be posts (we already have post table)

comments

reports

payouts

transactions

announcements

ads

user_activity_logs

admin_logs