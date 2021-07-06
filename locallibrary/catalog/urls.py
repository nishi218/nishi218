from django.urls import path ,include
from . import views

urlpatterns = [
    path('catalog/',include('catalog.urls')),
    
]
urlpatterns=[
    path('',views.index,name='index'),

]
#Add Django site authentication urls (for login, logout, password management)

urlpatterns += [
    path('accounts/', include('django.contrib.auth.urls')),
]
