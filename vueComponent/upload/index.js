// 引入依赖
import plupload from 'plupload'
import ajax from '../../config/ajax'
import api from '../../config/api'
import UUID from "uuidjs"

function pluploadFunc (params, filesAdded, fileUploaded, uploadComplete,beforeUpload) {
    let obj = params || {};
    // 可配置项
    let btnDomId = obj.btnDom || 'uploadBtn';  // 选择按钮id或者Dom对象

    // 获取后缀
    let get_suffix = (filename) => {
        let pos = filename.lastIndexOf('.'),
            suffix = ''
        if (pos != -1) {
            suffix = filename.substring(pos)
        }
        return suffix;
    }

    // 实例化之前 拿到令牌
    let queryToken = async () => {
        let Api = obj.api || api['minio']['getImagePolicy'];
        let data = await ajax.ajaxAction(Api);
        return data;
    }

    // 实例化plupload
    let uploader = new plupload.Uploader({
        runtimes: 'html5,flash,silverlight,html4',
        browse_button: btnDomId,
        multi_selection: true,
        flash_swf_url: 'js/Moxie.swf',
        silverlight_xap_url: 'js/Moxie.xap',
        filters: {
            mime_types: [
                {title: "Image files", extensions: "jpg,JPG,jpeg,JPEG,png,PNG,tif,tiff,TIF,TIFF,psd,Ats"},
                {title: "files", extensions: "doc,docx,xls,xlsx"}
            ],
            max_file_size: '1024000mb', //最大只能上传10mb的文件
            prevent_duplicates: false //不允许选取重复文件
        },

        multipart_params: {},

        init: {
            FilesAdded: async function(up, files) {
                // 拿取令牌
                let data = await queryToken();
                files.forEach(x => {
                    x.uuid = '';
                    x.sourcePath = '';
                });

                if (data.success) {

                    let value = typeof data.value === 'string'
                        ? JSON.parse(data.value || '{}')
                        : data.value;

                    up.multipart_params = value;

                    // 以图搜图
                    up.multipart_params.OSSAccessKeyId = value.accessid;

                    up.start();

                    filesAdded && filesAdded(files);
                }
            },

            BeforeUpload: function(up, file) {
                let uuid = UUID.generate();
                let v= up.multipart_params;
                // v.key = `${v.dir}/${uuid}${get_suffix(file.name)}`;
                v.key = `${v.dir.indexOf('/') >= 0 ? v.dir.replace('/', '') : v.dir}/${uuid}${get_suffix(file.name)}`;

                file.uuid = uuid;
                file.sourcePath = `${v.host}/${v.key}`;

                up.setOption({
                    url: v.host,
                    multipart_params: v,
                });
                up.start();
                beforeUpload && beforeUpload(up, file);
            },

            FileUploaded: function(up, file, info) {
                fileUploaded && fileUploaded(up, file, info);
            },
            UploadComplete : function(uploader,files) {
                uploadComplete && uploadComplete(uploader,files);
            },

        }
    });

    // 初始化Plupload实例
    uploader.init();
    return uploader;
}
// 导出Plupload实例
export default pluploadFunc;


// 该uploader实例上的属性
// id
// state
// runtime
// files
// settings
// total

// 该uploader实例上的方法
// init()
// setOption()
// getOption()
// refresh()
// start()
// stop()
// addFile(file, [fileName])
// removeFile(file)
// unbindAll()
// destroy()
// splice(start, length)
// trigger(name, Multiple)

/**
 // 当Plupload初始化完成后触发
 Init (up) {},

 // 当Init事件发生后触发
 PostInit (up) {},

 // 当调用plupload实例的refresh()方法后会触发该事件，
 // 暂时不清楚还有什么其他动作会触发该事件，
 // 测试，把文件添加到上传队列后也会触发该事件。
 Refresh (up) {},

 // 当上传队列的状态发生改变时触发
 StateChanged (up) {},

 // 当上传队列中某一个文件开始上传后触发
 UploadFile (up, file) {},

 // 当上传队列中某一个文件开始上传后触发
 BeforeUpload (up, file) {},

 // 当上传队列发生变化后触发，即上传队列新增了文件或移除了文件。QueueChanged事件会比FilesAdded或FilesRemoved事件先触发
 QueueChanged (up) {},

 // 会在文件上传过程中不断触发，可以用此事件来显示上传进度
 UploadProgress (up, file) {},

 // 当文件从上传队列移除后触发
 FilesRemoved (up, files) {},

 // 当文件添加到上传队列后触发监听函数参数
 FileFiltered () {},

 // 当文件添加到上传队列后触发
 FilesAdded (up, files) {},

 // 当队列中的某一个文件上传完成后触发 info 为服务器返回的信息对象
 FileUploaded (up, file, info) {},

 // 当上传队列中所有文件都上传完成后触发
 UploadComplete (up, files) {},

 // 当发生错误时触发
 Error (up, error) {},

 // 当调用destroy方法时触发
 Destroy (up) {}
*/
