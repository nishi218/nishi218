from django.shortcuts import render, redirect

# Create your views here.


def index(request):
    if request.method == "GET":
        return render(request, "index.html")
    else:
        room = request.POST['room_name']
        username = request.POST["username"]
        # print(username)

        return redirect('/'+room+'/'+username+'/')


def room(request, room_name, username):
    # room_name = request.GET.get('room_name')
    # username = request.GET.get('username')
    context = {'room_name': room_name,
               'username': username}
    return render(request, 'room.html', context=context)
