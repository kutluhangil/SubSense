import re

with open('components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = """import UpcomingTimeline from './dashboard/UpcomingTimeline';
import ExpenseBreakdown from './dashboard/ExpenseBreakdown';
"""
content = content.replace("import Sidebar from './Sidebar';", imports + "import Sidebar from './Sidebar';")

# Remove definitions
upcoming_pattern = re.compile(r'\s*const UpcomingTimeline = \(\) => \{.*?(?=\s*const ExpenseBreakdown = \(\) => \{)', re.DOTALL)
content = upcoming_pattern.sub('\n', content)

expense_pattern = re.compile(r'\s*const ExpenseBreakdown = \(\) => \{.*?(?=\s*const renderContent = \(\) => \{)', re.DOTALL)
content = expense_pattern.sub('\n\n   ', content)

# Update usages
# Check what derivedStats is named in Dashboard.tsx
content = content.replace("<UpcomingTimeline />", "<UpcomingTimeline subscriptions={subscriptions} subscriptionsLoading={subscriptionsLoading} setIsCalendarOpen={setIsCalendarOpen} setSelectedSub={setSelectedSub} handleMarkAsPaid={handleMarkAsPaid} />")

content = content.replace("<ExpenseBreakdown />", "<ExpenseBreakdown metrics={derivedStats} subscriptionsLoading={subscriptionsLoading} setCurrentView={setCurrentView} />")

with open('components/Dashboard.tsx', 'w') as f:
    f.write(content)

print("Dashboard.tsx refactored successfully.")
