	;(function(){
		'use strict';

		var task__list = [];
		init()

		function init(){
			task__list = store.get('task__list') || [];
			if(task__list.length){
				render_task_list()
				task_remind_check()
			}
		}

		
		$('.add-task').on('submit',listen_task_submit)

		function task_remind_check(){
			var current_timestamp;
			var itl = setInterval(function(){
				for(var i=0;i<task__list.length;i++){

					var item = task__list[i];


					if(!item || !item.remind_time) continue;


					current_timestamp = (new Date()).getTime();
					var set_timestamp = (new Date(item.remind_time).getTime());
					if(current_timestamp - set_timestamp <= 1){
						update_task(i,{informed: false})						
					}

					if(item.informed) continue;
					if(current_timestamp - set_timestamp >= 1){
						show_msg(item.content);
						update_task(i,{informed: true})						
					}
				}

			},600)
		}

		function show_msg(msg){
			if(!msg) return;
			$('.msg-content').html(msg);
			$('.alerter').get(0).play();
			$('.msg').show();
		}

		$('.msg-know').on('click',hide_msg);

		function hide_msg(){
			$('.msg').hide();
		}

		function listen_task_detail(){
			var index = $(this).parent().parent().data('index');
			show_task_detail(index);
		}
		function show_task_detail(index){
			render_task_detail(index);
			$('.task-detail').show();
			$('.task-detail-mask').show();
		}

		$('.task-detail-mask').on('click',function(){
			hide_task_detail()
		})
		function render_task_detail(index){ 
			if(index == undefined || !task__list[index]) return;
			var item = task__list[index];
			var tpl = 
				'<form>' +  
			    	'<div class="content">' + 
			        item.content +
			    	'</div>' +
			    	'<div class="input-item">' +
			    	'<input style = "display:none;" type="text" name= "content" value = "'+ (item.content || '') +'">' +
			    	'</div>' +
			    	'<div>' + 
					'<div class="desc input-item">' + 
					'<textarea name="desc">'+( item.desc || '') +'</textarea>' + 
					'</div>' + 
			    	'</div>' + 
			    	'<div class="remind input-item">' + 
			    	'<lable>提醒时间</lable>' +
					'<input class="datetime" name = "remind_time" type="text" value="' + (item.remind_time || '')+ '">' + 
					'</div>' +
					'<div class="input-item">' +
					'<button type="submit">更新</button>' +
					'</div>' + 
			    	'</div>' + 
	    	    '</form>' ;

	    	$('.task-detail').html(''); 
	    	$('.task-detail').html(tpl);
	    	$('.datetime').datetimepicker();

	    	var $input = $('.task-detail').find('form').find('.input-item').find('input');

	    	$('.task-detail').find('form').find('.content').on('dblclick',function(){
	    		$(this).hide();
	    		$input.show();
	    	})

	    	$('.task-detail').find('form').on('submit',function(e){
	    		e.preventDefault();
	    		var data = {};
	    		data.content = $input.val();
	    		data.desc = $(this).find('textarea').val();
	    		data.remind_time = $(this).find('[name=remind_time]').val();

	    		hide_task_detail()
	    		update_task(index,data);
	    	})   

		}

		function hide_task_detail(){
			$('.task-detail').hide()
			$('.task-detail-mask').hide()
		}


		function listen_task_delete(){
			var index = $(this).parent().parent().data('index');
			task__list[index] = null;
			updateList()
		}

		function listen_task_checked(){
			var index = $(this).parent().data('index');
			var item = get(index);
			console.log(item)
			if(item.complete){
				update_task(index,{complete:false})
			}else{
				update_task(index,{complete:true})
			}
		}
		function get(index){
			return store.get('task__list')[index];
		}
		function update_task(index,item){
			if(!index && !task__list[index]) return;

			task__list[index] = $.extend({},task__list[index],item);
			updateList()
		}

		function listen_task_submit(e){
			e.preventDefault();
			var new_task={};

			new_task.content = $('.add-task').find('input').val();

			if(!new_task.content){
				return;
			}else{
				add_task(new_task);
				$('.add-task').find('input').val(null);
			}			
		}

		function add_task(content){
			if(!content) return;
			task__list.push(content);
			updateList();
		}

		function updateList(){
			store.set('task__list',task__list);
			render_task_list();
		}

		function render_task_list(){
			$('.task-list').html('');
			var completed_task = [];
			for(var i=0;i<task__list.length;i++){
				var item = task__list[i];
				if(item && item.complete){
					completed_task[i] = item ;
				}else{
					var task = render_task_item(item,i);
					
				}
				$('.task-list').prepend(task);
			}

			for(var j=0;j<completed_task.length;j++){
				task = render_task_item(completed_task[j],j)
				if(!task) continue;
				task.addClass('completed')
				$('.task-list').append(task)
			}
			
			$('.task-item').on('dblclick',listen_task_detail)
			$('.delete').on('click',listen_task_delete)
			$('.detail').on('click',listen_task_detail)
			$('.task-item input[type=checkbox]').on('click',listen_task_checked)
		}

		function render_task_item(item,i){
			if(!item || i == undefined) return;
			var list_item_tpl =
				'<div class="task-item" data-index= '+i+' >' + 
					'<input type="checkbox" '+ (item.complete?'checked':'') + '>' + 
					'<span class="task-content">'+ item.content +'</span>' + 
					'<span class="fr">' + 
						'<span class="delete"> 删除</span>' + 
						'<span class="detail"> 详细</span>' + 
					'</span>' + 				
				'</div>'
			return $(list_item_tpl);
			

		}

	})();