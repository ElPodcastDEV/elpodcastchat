start:
	@if [ -z "$(byobu list-sessions | grep EPDChat)" ]; then\
		byobu new -dt EPDChat;\
		byobu rename-window Workarea;\
		byobu split-pane -v;\
		byobu send-keys 'npm run dev' C-m;\
		byobu resize-pane -D 25;\
		byobu select-pane -t 0;\
		byobu send-keys 'vim' C-m;\
	fi
	byobu attach -t EPDChat;

