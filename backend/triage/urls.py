from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MachineViewSet, TechnicianViewSet, FaultTicketViewSet, DashboardView, AuthView

router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'technicians', TechnicianViewSet, basename='technician')
router.register(r'tickets', FaultTicketViewSet, basename='ticket')

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('auth/login/', AuthView.as_view(), name='auth-login'),
    path('auth/me/', AuthView.as_view(), name='auth-me'),
    path('', include(router.urls)),
]
