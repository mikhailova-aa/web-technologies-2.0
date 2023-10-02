import grpc
from concurrent import futures
import my_service_pb2
import my_service_pb2_grpc

class MyService(my_service_pb2_grpc.MyServiceServicer):
    def SendMessage(self, request, context):
        response = my_service_pb2.MyResponse(
        message=request.message,
        nested_message=request.nested_message
        )


        return response

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    my_service_pb2_grpc.add_MyServiceServicer_to_server(MyService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server started on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
